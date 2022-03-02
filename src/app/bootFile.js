import fs from 'fs'
import { ipcRenderer } from 'electron'
import { dialog, app, getCurrentWindow } from '@electron/remote'
import { machineIdSync } from 'node-machine-id'

import { SYSTEM_REDUCER_KEYS, actions, migrateIfNeeded, featureFlags, emptyFile } from 'pltr/v2'
import { t } from 'plottr_locales'
import { currentUser, initialFetch, overwriteAllKeys } from 'wired-up-firebase'

import { fileSystemAPIs } from '../api'
import { dispatchingToStore, makeFlagConsistent } from './makeFlagConsistent'
import { offlineFilePath } from '../files'
import { uploadProject } from '../common/utils/upload_project'
import { resumeDirective } from '../resume'
import { logger } from '../logger'
import { store } from 'store'
import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'

const clientId = machineIdSync()

const rollbar = setupRollbar('app.html')

const win = getCurrentWindow()

const withFileId = (fileId, file) => ({
  ...file,
  file: {
    ...file.file,
    id: fileId,
  },
})

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

const MAX_ATTEMPTS = 5

function waitForUser() {
  return new Promise((resolve, reject) => {
    function iter(attempts) {
      if (attempts >= MAX_ATTEMPTS) {
        reject(new Error(`Couldn't get the user after 5 seconds of trying.`))
        return
      }
      const user = currentUser()
      if (user) {
        resolve(user)
      } else {
        setTimeout(() => {
          iter(attempts + 1)
        }, 1000)
      }
    }
    iter(0)
  })
}

const loadFileIntoRedux = (data, fileId) => {
  store.dispatch(
    actions.ui.loadFile(
      data.file.fileName,
      false,
      Object.assign({}, emptyFile(data.file.fileName, data.file.version), withFileId(fileId, data)),
      data.file.version
    )
  )
  store.dispatch(
    actions.project.selectFile({
      ...data.file,
      id: fileId,
    })
  )
}

function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

const migrate = (originalFile, fileId) => (overwrittenFile) => {
  const json = overwrittenFile || originalFile
  return new Promise((resolve, reject) => {
    migrateIfNeeded(
      app.getVersion(),
      json,
      json.file.fileName,
      null,
      (error, migrated, data) => {
        if (error) {
          rollbar.error(error)
          reject(error)
          return
        }
        if (migrated) {
          logger.info(
            `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
          )
          overwriteAllKeys(fileId, clientId, removeSystemKeys(data))
            .then((results) => {
              loadFileIntoRedux(data, fileId)
              store.dispatch(actions.client.setClientId(clientId))
              return results
            })
            .then(resolve, reject)
        } else {
          loadFileIntoRedux(data, fileId)
          store.dispatch(actions.client.setClientId(clientId))
          resolve(data)
        }
      },
      logger
    )
  })
}

/* If we find that we had an offline backup, we need to either:
 *  - Backup the local copy and open the online copy,
 *  - overwrite the cloud copy, or
 *  - do nothing (i.e. just load the cloud copy).
 *
 * We signal to the caller that we overwrote the cloud copy by
 * producing the new file for it to load.  Otherwise, we produce false
 * to signal that it should load the original file.
 */
const handleOfflineBackup = (backupOurs, uploadOurs, fileId, offlineFile, email, userId) => {
  if (backupOurs) {
    logger.info(
      `Backing up a local version of ${fileId} because both offline and online versions changed.`
    )
    const date = new Date()
    const file = {
      ...offlineFile,
      file: {
        ...offlineFile.file,
        fileName: `${decodeURI(offlineFile.file.fileName)} - Resume Backup - ${
          date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}`,
      },
    }
    return uploadProject(file, email, userId)
      .then((result) => ({
        ...offlineFile,
        file: {
          ...offlineFile.file,
          id: result.data.fileId,
        },
      }))
      .then(() => {
        return false
      })
  } else if (uploadOurs) {
    logger.info(
      `Overwriting the cloud version of ${fileId} with a local offline version because it didn't change but the local version did.`
    )
    return overwriteAllKeys(fileId, clientId, {
      ...removeSystemKeys(offlineFile),
      file: {
        ...offlineFile.file,
        fileName: offlineFile.file.originalFileName || offlineFile.file.fileName,
      },
    })
  }
  return Promise.resolve(false)
}

function handleNoFileId(fileId, filePath) {
  const errorObject = new Error('Could not open cloud file.')
  rollbar.error(
    `Attempted to open ${filePath} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
    errorObject
  )
  logger.error(
    `Attempted to open ${filePath} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
    errorObject
  )
  dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
  return Promise.reject(new Error(`Cannot open file with id: ${fileId} from filePath: ${filePath}`))
}

function handleNoUserId(filePath) {
  const errorMessage = `Tried to boot plottr cloud file (${filePath}) without a user id.`
  rollbar.error(errorMessage)
  return Promise.reject(new Error(errorMessage))
}

const handleEroneousUserStates = (filePath) => (user) => {
  if (!user.uid) {
    return handleNoUserId(filePath)
  }
  return user
}

const computeAndHandleResumeDirectives = (fileId, email, userId, json) => {
  const settings = fileSystemAPIs.currentAppSettings()
  if (!settings.user.enableOfflineMode) {
    return Promise.resolve(false)
  }
  const offlinePath = offlineFilePath(json)
  const exists = fs.existsSync(offlinePath)
  const offlineFile = exists && JSON.parse(fs.readFileSync(offlinePath))
  const [uploadOurs, backupOurs] = exists ? resumeDirective(offlineFile, json) : [false, false]
  return handleOfflineBackup(backupOurs, uploadOurs, fileId, offlineFile, email, userId)
}

const afterLoading = (json) => {
  logger.info(`Loaded file ${json.file.fileName}.`)
}

const bootWithUser = (fileId) => (user) => {
  const userId = user.uid
  const email = user.email
  return initialFetch(userId, fileId, clientId, app.getVersion())
    .then((fetchedFile) => {
      return computeAndHandleResumeDirectives(fileId, email, userId, fetchedFile)
        .then(migrate(fetchedFile, fileId))
        .then(afterLoading)
    })
    .catch((error) => {
      const errorMessage = `Error fetching ${fileId} for user: ${userId}, clientId: ${clientId}`
      logger.error(errorMessage, error)
      rollbar.error(errorMessage, error)
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
      return Promise.reject(error)
    })
}

const handleErrorBootingFile = (fileId) => (error) => {
  const errorMessage = `Error booting ${fileId} clientId: ${clientId}`
  logger.error(errorMessage, error)
  rollbar.error(errorMessage, error)
  dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
  return Promise.reject(error)
}

function bootCloudFile(filePath) {
  const fileId = filePath.split('plottr://')[1]
  if (!fileId) {
    return handleNoFileId(fileId, filePath)
  }

  return waitForUser()
    .then(handleEroneousUserStates(filePath))
    .then(bootWithUser(fileId))
    .catch(handleErrorBootingFile(fileId))
}

function bootLocalFile(filePath, numOpenFiles, beatHierarchy) {
  win.setTitle('Plottr')
  win.setRepresentedFilename(filePath)
  let json
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    // In case this file was downloaded and we want to open it while
    // logged out, we need to reset the cloud flag.  (This is usually
    // set when we receive the file from Firebase, but it gets
    // synchronised back up to the database and if you then download
    // the file it'll be there.)
    //
    // This use case is actually quite common: you might want to
    // simply open a backup file locally.
    json.file.isCloudFile = false
  } catch (error) {
    return Promise.resolve()
  }
  ipcRenderer.send('save-backup', filePath, json)
  return new Promise((resolve, reject) => {
    migrateIfNeeded(
      app.getVersion(),
      json,
      filePath,
      null,
      (err, didMigrate, state) => {
        if (err) {
          rollbar.error(err)
          logger.error(err)
          // We... still load the file!?
        }
        store.dispatch(actions.ui.loadFile(filePath, didMigrate, state, state.file.version))

        MPQ.projectEventStats(
          'open_file',
          { online: navigator.onLine, version: state.file.version, number_open: numOpenFiles },
          state
        )

        const withDispatch = dispatchingToStore(store.dispatch)
        makeFlagConsistent(
          state,
          beatHierarchy,
          featureFlags.BEAT_HIERARCHY_FLAG,
          withDispatch(actions.featureFlags.setBeatHierarchy),
          withDispatch(actions.featureFlags.unsetBeatHierarchy)
        )

        if (state && state.tour && state.tour.showTour)
          store.dispatch(actions.ui.changeOrientation('horizontal'))

        store.dispatch(actions.client.setClientId(clientId))

        resolve()
      },
      logger
    )
  })
}

export function bootFile(filePath, options, numOpenFiles) {
  // Now that we know what the file path for this window should be,
  // tell the main process.
  ipcRenderer.send('pls-set-my-file-path', filePath)

  // And then boot the file.
  const { beatHierarchy } = options
  const isCloudFile = isPlottrCloudFile(filePath)

  try {
    store.dispatch(actions.applicationState.startLoadingFile())
    return (
      isCloudFile ? bootCloudFile(filePath) : bootLocalFile(filePath, numOpenFiles, beatHierarchy)
    )
      .then(() => {
        store.dispatch(actions.applicationState.finishLoadingFile())
      })
      .catch((error) => {
        store.dispatch(actions.applicationState.finishLoadingFile())
        // TODO: error dialog and ask the user to try again
        logger.error(error)
        rollbar.error(error)
      })
  } catch (error) {
    // TODO: error dialog and ask the user to try again
    logger.error(error)
    rollbar.error(error)
    return Promise.reject(error)
  }
}

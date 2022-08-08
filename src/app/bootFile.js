import fs from 'fs'
import { ipcRenderer } from 'electron'
import { dialog, app, getCurrentWindow } from '@electron/remote'
import { machineIdSync } from 'node-machine-id'

import { SYSTEM_REDUCER_KEYS, actions, migrateIfNeeded, featureFlags, emptyFile } from 'pltr/v2'
import { t } from 'plottr_locales'
import { currentUser, initialFetch, overwriteAllKeys } from 'wired-up-firebase'

import { makeFileSystemAPIs } from '../api'
import { dispatchingToStore, makeFlagConsistent } from './makeFlagConsistent'
import { offlineFilePath } from '../files'
import { uploadProject } from '../common/utils/upload_project'
import { resumeDirective } from '../resume'
import logger from '../../shared/logger'
import { store } from 'store'
import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import { makeFileModule } from './files'

const clientId = machineIdSync()

let rollbar
setupRollbar('app.html').then((newRollbar) => {
  rollbar = newRollbar
})

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
          if (error === 'Plottr behind file') {
            return reject('Need to update Plottr')
          }
          return reject(error)
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

export function bootFile(whenClientIsReady, filePath, options, numOpenFiles, saveBackup) {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)

  const { backupOfflineBackupForResume } = makeFileModule(whenClientIsReady)

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
    return backupOfflineBackupForResume(offlineFile).then(() => {
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
        }).catch((error) => {
          logger.error(`Erorr uploading our offline file ${fileId}`, error)
          dialog.showErrorBox(
            t('Error'),
            t('There was an error uploading your offline backup. Please exit and start again')
          )
        })
      }
      return Promise.resolve(false)
    })
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
    return Promise.reject(
      new Error(`Cannot open file with id: ${fileId} from filePath: ${filePath}`)
    )
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
    return fileSystemAPIs.currentAppSettings().then((settings) => {
      if (!settings.user.enableOfflineMode) {
        return Promise.resolve(false)
      }
      const offlinePath = offlineFilePath(json)
      const exists = fs.existsSync(offlinePath)
      // FIXME: the socket server now has a way to read files.  We don't
      // want to depend on FS from the renderer because that'll call out
      // to the main process.
      const offlineFile = exists && JSON.parse(fs.readFileSync(offlinePath))
      if (!offlineFile.file) {
        logger.warn(
          `There's an offline backup of file with id ${fileId} at ${offlinePath}, but it appears to be broken or incomplete`
        )
        return Promise.resolve(false)
      }
      const [uploadOurs, backupOurs] = exists ? resumeDirective(offlineFile, json) : [false, false]
      return handleOfflineBackup(backupOurs, uploadOurs, fileId, offlineFile, email, userId)
    })
  }

  const afterLoading = (userId, saveBackup) => (json) => {
    logger.info(`Loaded file ${json.file.fileName}.`)
    saveBackup(`${json.file.fileName}.pltr`, json)
  }

  const makeFlagsConsistent = (beatHierarchy) => (json) => {
    const withDispatch = dispatchingToStore(store.dispatch)
    makeFlagConsistent(
      json,
      beatHierarchy,
      featureFlags.BEAT_HIERARCHY_FLAG,
      withDispatch(actions.featureFlags.setBeatHierarchy),
      withDispatch(actions.featureFlags.unsetBeatHierarchy)
    )
    return json
  }

  const bootWithUser = (fileId, beatHierarchy, saveBackup) => (user) => {
    const userId = user.uid
    const email = user.email
    return initialFetch(userId, fileId, clientId, app.getVersion())
      .then((fetchedFile) => {
        return computeAndHandleResumeDirectives(fileId, email, userId, fetchedFile)
          .then(migrate(fetchedFile, fileId))
          .then(makeFlagsConsistent(beatHierarchy))
          .then(afterLoading(userId, saveBackup))
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

  function bootCloudFile(filePath, beatHierarchy, saveBackup) {
    const fileId = filePath.split('plottr://')[1]
    if (!fileId) {
      return handleNoFileId(fileId, filePath)
    }

    return waitForUser()
      .then(handleEroneousUserStates(filePath))
      .then(bootWithUser(fileId, beatHierarchy, saveBackup))
      .catch(handleErrorBootingFile(fileId))
  }

  function bootLocalFile(filePath, numOpenFiles, beatHierarchy, saveBackup) {
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
      logger.error(error)
      rollbar.error(error)
      return Promise.reject(`bootLocalFile001: json-parse (${filePath})`)
    }
    saveBackup(filePath, json)
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
            if (err === 'Plottr behind file') {
              return reject('Need to update Plottr')
            }
            return reject(`bootLocalFile002: migration (${filePath})`)
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

  function _bootFile(filePath, options, numOpenFiles, saveBackup) {
    // Now that we know what the file path for this window should be,
    // tell the main process.
    ipcRenderer.send('pls-set-my-file-path', filePath)

    // And then boot the file.
    const { beatHierarchy } = options
    const isCloudFile = isPlottrCloudFile(filePath)

    try {
      store.dispatch(actions.applicationState.startLoadingFile())
      return (
        isCloudFile
          ? bootCloudFile(filePath, beatHierarchy, saveBackup)
          : bootLocalFile(filePath, numOpenFiles, beatHierarchy, saveBackup)
      )
        .then(() => {
          store.dispatch(actions.applicationState.finishLoadingFile())
        })
        .catch((error) => {
          console.log('caught error', error)
          logger.error(error)
          rollbar.error(error)
          store.dispatch(actions.applicationState.errorLoadingFile(true))
        })
    } catch (error) {
      logger.error(error)
      rollbar.error(error)
      store.dispatch(actions.applicationState.errorLoadingFile())
      return Promise.reject(error)
    }
  }

  _bootFile(filePath, options, numOpenFiles, saveBackup)
}

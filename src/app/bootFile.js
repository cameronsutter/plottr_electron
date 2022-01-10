import fs from 'fs'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ipcRenderer, remote } from 'electron'
import { machineIdSync } from 'node-machine-id'

import { SYSTEM_REDUCER_KEYS, actions, migrateIfNeeded, featureFlags, emptyFile } from 'pltr/v2'
import { t } from 'plottr_locales'
import { currentUser, initialFetch, overwriteAllKeys } from 'wired-up-firebase'
import world from 'world-api'

import { displayFileName } from '../common/utils/known_files'
import { dispatchingToStore, makeFlagConsistent } from './makeFlagConsistent'
import { offlineFilePath } from '../files'
import { uploadProject } from '../common/utils/upload_project'
import { resumeDirective } from '../resume'
import { logger } from '../logger'
import { store } from 'store'
import { fileSystemAPIs } from '../api'
import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import Main from 'containers/Main'
import Listener from './components/listener'
import Renamer from './components/Renamer'

const clientId = machineIdSync()

const { dialog, app } = remote

const rollbar = setupRollbar('app.html')

const win = remote.getCurrentWindow()

const root = document.getElementById('react-root')

const withFileId = (fileId, file) => ({
  ...file,
  file: {
    ...file.file,
    id: fileId,
  },
})

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

const shouldForceDashboard = (openFirst, numOpenFiles) => {
  if (numOpenFiles > 1) return false
  if (openFirst === undefined) return true // the default is always show first
  return openFirst
}

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

const migrate = (originalFile, fileId, forceDashboard) => (overwrittenFile) => {
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

const renderFile = (forceDashboard) => () => {
  render(
    <Provider store={store}>
      <Listener />
      <Renamer />
      <Main forceProjectDashboard={forceDashboard} />
    </Provider>,
    root
  )
}

function handleNoUser(filePath) {
  logger.warn(`Booting a cloud file at ${filePath} but the user isn't logged in.`)
  renderFile()()
  return
}

function handleNoUserId(filePath) {
  const errorMessage = `Tried to boot plottr cloud file (${filePath}) without a user id.`
  rollbar.error(errorMessage)
  return Promise.reject(new Error(errorMessage))
}

const handleEroneousUserStates = (filePath) => (user) => {
  // I'm not sure why this branch came about.  It doesn't look right at all.
  if (!user) {
    return handleNoUser(filePath)
  } else {
    if (!user.uid) {
      return handleNoUserId(filePath)
    }
    return user
  }
}

const computeAndHandleResumeDirectives = (fileId, email, userId, forceDashboard, json) => {
  const offlinePath = offlineFilePath(json)
  const exists = fs.existsSync(offlinePath)
  const offlineFile = exists && JSON.parse(fs.readFileSync(offlinePath))
  const [uploadOurs, backupOurs] = exists ? resumeDirective(offlineFile, json) : [false, false]
  return handleOfflineBackup(backupOurs, uploadOurs, fileId, offlineFile, email, userId)
}

const afterLoading = (json) => {
  logger.info(`Loaded file ${json.file.fileName}.`)
  win.setTitle(displayFileName(json.file.fileName))
}

const bootWithUser = (fileId, forceDashboard) => (user) => {
  const userId = user.uid
  const email = user.email
  return initialFetch(userId, fileId, clientId, app.getVersion())
    .then((fetchedFile) => {
      return computeAndHandleResumeDirectives(fileId, email, userId, forceDashboard, fetchedFile)
        .then(migrate(fetchedFile, fileId, forceDashboard))
        .then(afterLoading)
        .then(renderFile(forceDashboard))
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

function bootCloudFile(filePath, forceDashboard) {
  const fileId = filePath.split('plottr://')[1]
  if (!fileId) {
    return handleNoFileId(fileId, filePath)
  }

  return waitForUser()
    .then(handleEroneousUserStates(filePath))
    .then(bootWithUser(fileId, forceDashboard))
    .catch(handleErrorBootingFile(fileId))
}

function bootLocalFile(filePath, numOpenFiles, darkMode, beatHierarchy, forceDashboard) {
  win.setTitle(displayFileName(filePath))
  win.setRepresentedFilename(filePath)
  let json
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (error) {
    renderFile(forceDashboard)()
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

        if (state.ui && state.ui.darkMode !== darkMode) {
          store.dispatch(actions.ui.setDarkMode(darkMode))
        }
        if (darkMode) window.document.body.className = 'darkmode'

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

        renderFile(forceDashboard)()
        resolve()
      },
      logger
    )
  })
}

export function bootFile(filePath, options, numOpenFiles) {
  const { darkMode, beatHierarchy } = options
  const isCloudFile = isPlottrCloudFile(filePath)
  const settings = fileSystemAPIs.currentAppSettings()
  const forceDashboard = shouldForceDashboard(settings.user?.openDashboardFirst, numOpenFiles)

  // TODO: not sure when/whether we should unsubscribe.  Presumably
  // when the window is refreshed/closed?
  //
  // Could be important to do so because it might set up inotify
  // listeners and too many of those cause slow-downs.
  const unsubscribePublishers = world.publishChangesToStore(store)

  try {
    store.dispatch(actions.applicationState.startLoadingFile())
    ;(isCloudFile
      ? bootCloudFile(filePath, forceDashboard)
      : bootLocalFile(filePath, numOpenFiles, darkMode, beatHierarchy, forceDashboard)
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
  }
}

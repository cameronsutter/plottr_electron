import { helpers, SYSTEM_REDUCER_KEYS, actions, migrateIfNeeded, emptyFile } from 'pltr/v2'
import { t } from 'plottr_locales'
import {
  currentUser,
  initialFetch,
  overwriteAllKeys,
  saveBackup as saveBackupOnFirebase,
} from 'wired-up-firebase'
import exportToSelfContainedPlottrFile from 'plottr_import_export/src/exporter/plottr'

import { makeFileSystemAPIs } from '../api'
import { offlineFileURLFromFile } from '../files'
import { uploadProject } from '../common/utils/upload_project'
import { resumeDirective } from '../resume'
import logger from '../../shared/logger'
import { store } from 'store'
import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import { makeFileModule } from './files'
import { offlineFileURL } from '../common/utils/files'
import Saver from './saver'
import { saveFile, backupFile } from './save'
import {
  makeCachedDownloadStorageImage,
  downloadStorageImage,
} from '../common/downloadStorageImage'
import { makeMainProcessClient } from './mainProcessClient'

const {
  setWindowTitle,
  setRepresentedFileName,
  getVersion,
  showErrorBox,
  showMessageBox,
  machineId,
  setMyFilePath,
  isRestarting,
} = makeMainProcessClient()

let rollbar
setupRollbar('app.html').then((newRollbar) => {
  rollbar = newRollbar
})

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

// NOTE: Only for cloud files.
const loadFileIntoRedux = (data, fileId) => {
  store.dispatch(
    actions.ui.loadFile(
      data.file.fileName,
      false,
      Object.assign({}, emptyFile(data.file.fileName, data.file.version), withFileId(fileId, data)),
      data.file.version,
      helpers.file.fileIdToPlottrCloudFileURL(fileId)
    )
  )
  store.dispatch(
    actions.project.selectFile({
      ...data.file,
      id: fileId,
    })
  )
}

export function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

const migrate = (originalFile, fileId) => (overwrittenFile) => {
  const json = overwrittenFile || originalFile
  return getVersion().then((version) => {
    return new Promise((resolve, reject) => {
      migrateIfNeeded(
        version,
        json,
        helpers.file.fileIdToPlottrCloudFileURL(fileId),
        null,
        (error, migrated, data) => {
          if (error) {
            rollbar.error(error)
            if (error === 'Plottr behind file') {
              return reject(new Error('Need to update Plottr'))
            }
            return reject(error)
          }
          machineId().then((clientId) => {
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
          })
        },
        logger
      )
    })
  })
}

const SAVE_INTERVAL_MS = 10000
const BACKUP_INTERVAL_MS = 60000
let saver = null

export function bootFile(
  whenClientIsReady,
  fileURL,
  options,
  numOpenFiles,
  saveBackup,
  bootingOfflineFile
) {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)

  const { backupOfflineBackupForResume } = makeFileModule(whenClientIsReady)

  const cachedDowloadStorageImage = makeCachedDownloadStorageImage(downloadStorageImage)

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
        return machineId().then((clientId) => {
          return overwriteAllKeys(fileId, clientId, {
            ...removeSystemKeys(offlineFile),
            file: {
              ...offlineFile.file,
              fileName: offlineFile.file.originalFileName || offlineFile.file.fileName,
            },
          }).catch((error) => {
            logger.error(`Erorr uploading our offline file ${fileId}`, error)
            return showErrorBox(
              t('Error'),
              t('There was an error uploading your offline backup. Please exit and start again')
            )
          })
        })
      }
      return Promise.resolve(false)
    })
  }

  function handleNoFileId(fileId, fileURL) {
    const errorObject = new Error('Could not open cloud file.')
    rollbar.error(
      `Attempted to open ${fileURL} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
      errorObject
    )
    logger.error(
      `Attempted to open ${fileURL} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
      errorObject
    )
    return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
      return Promise.reject(
        new Error(`Cannot open file with id: ${fileId} from fileURL: ${fileURL}`)
      )
    })
  }

  function handleNoUserId(fileURL) {
    const errorMessage = `Tried to boot plottr cloud file (${fileURL}) without a user id.`
    rollbar.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  }

  const handleEroneousUserStates = (fileURL) => (user) => {
    if (!user.uid) {
      return handleNoUserId(fileURL)
    }
    return user
  }

  const computeAndHandleResumeDirectives = (fileId, email, userId, json) => {
    return fileSystemAPIs.currentAppSettings().then((settings) => {
      if (!settings.user.enableOfflineMode) {
        return Promise.resolve(false)
      }
      return offlineFileURLFromFile(json).then((offlineURL) => {
        if (!offlineURL) {
          logger.warn(`Could not compute an offline path for file: ${json?.file}`)
          return Promise.resolve(false)
        }
        const offlinePath = helpers.file.withoutProtocol(offlineURL)
        return whenClientIsReady(({ fileExists }) => {
          return fileExists(offlinePath)
        })
          .then((exists) => {
            return offlinePath && exists
          })
          .then((exists) => {
            return whenClientIsReady(({ readFile }) => {
              return exists
                ? readFile(offlinePath).then((file) => {
                    return JSON.parse(file)
                  })
                : Promise.resolve(null)
            })
          })
          .then((offlineFile) => {
            if (!offlineFile) {
              return false
            }
            if (!offlineFile.file) {
              logger.warn(
                `There's an offline backup of file with id ${fileId} at ${offlinePath}, but it appears to be broken or incomplete`
              )
              return Promise.resolve(false)
            }
            const [uploadOurs, backupOurs] = resumeDirective(offlineFile, json)
            return handleOfflineBackup(backupOurs, uploadOurs, fileId, offlineFile, email, userId)
          })
      })
    })
  }

  const afterLoading = (userId, saveBackup) => (json) => {
    logger.info(`Loaded file ${json.file.fileName}.`)
    exportToSelfContainedPlottrFile(
      json,
      userId,
      cachedDowloadStorageImage.downloadStorageImage
    ).then((selfContainedFile) => {
      saveBackup(`${json.file.fileName}.pltr`, selfContainedFile)
    })
  }

  const bootWithUser = (fileId, saveBackup) => (user) => {
    const userId = user.uid
    const email = user.email
    return Promise.all([getVersion(), machineId()]).then(([version, clientId]) => {
      return initialFetch(userId, fileId, clientId, version)
        .then((fetchedFile) => {
          return computeAndHandleResumeDirectives(fileId, email, userId, fetchedFile)
            .then(migrate(fetchedFile, fileId))
            .then(afterLoading(userId, saveBackup))
        })
        .catch((error) => {
          const errorMessage = `Error fetching ${fileId} for user: ${userId}, clientId: ${clientId}`
          logger.error(errorMessage, error)
          rollbar.error(errorMessage, error)
          return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(
            () => {
              return Promise.reject(error)
            }
          )
        })
    })
  }

  const handleErrorBootingFile = (fileId) => (error) => {
    machineId().then((clientId) => {
      const errorMessage = `Error booting ${fileId} clientId: ${clientId}`
      logger.error(errorMessage, error)
      rollbar.error(errorMessage, error)
      return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
        return Promise.reject(error)
      })
    })
  }

  function bootCloudFile(fileURL, saveBackup) {
    const fileId = fileURL.split('plottr://')[1]
    if (!fileId) {
      return handleNoFileId(fileId, fileURL)
    }

    return waitForUser()
      .then(handleEroneousUserStates(fileURL))
      .then(bootWithUser(fileId, saveBackup))
      .catch(handleErrorBootingFile(fileId))
  }

  function bootLocalFile(fileURL, numOpenFiles, saveBackup) {
    return setWindowTitle('Plottr')
      .then(() => {
        return setRepresentedFileName(helpers.file.withoutProtocol(fileURL))
      })
      .then(() => {
        return offlineFileURL(fileURL)
          .then((offlineFileURL) => {
            const filePath = helpers.file.withoutProtocol(
              bootingOfflineFile ? offlineFileURL(fileURL) : fileURL
            )
            return whenClientIsReady(({ readFile }) => {
              return readFile(filePath)
            })
              .then((rawFile) => {
                return JSON.parse(rawFile)
              })
              .then((json) => {
                // In case this file was downloaded and we want to open it while
                // logged out, we need to reset the cloud flag.  (This is usually
                // set when we receive the file from Firebase, but it gets
                // synchronised back up to the database and if you then download
                // the file it'll be there.)
                //
                // This use case is actually quite common: you might
                // want to simply open a backup file locally.
                return {
                  ...json,
                  file: {
                    ...json.file,
                    isCloudFile: false,
                  },
                }
              })
          })
          .then((json) => {
            return saveBackup(fileURL, json).then(() => {
              return json
            })
          })
          .then((json) => {
            return getVersion().then((version) => {
              return new Promise((resolve, reject) => {
                migrateIfNeeded(
                  version,
                  json,
                  fileURL,
                  null,
                  (err, didMigrate, state) => {
                    if (err) {
                      rollbar.error(err)
                      logger.error(err)
                      if (err === 'Plottr behind file') {
                        return reject(new Error('Need to update Plottr'))
                      }
                      return reject(`bootLocalFile002: migration (${fileURL})`)
                    }
                    store.dispatch(
                      actions.ui.loadFile(
                        state.file.fileName || helpers.file.withoutProtocol(fileURL),
                        didMigrate,
                        {
                          ...state,
                          file: {
                            ...state.file,
                            originalVersionStamp:
                              state.file.originalVersionStamp || state.file.versionStamp,
                          },
                        },
                        state.file.version,
                        fileURL
                      )
                    )
                    store.dispatch(
                      actions.project.selectFile({
                        ...state.file,
                        fileURL,
                        id: helpers.file.fileIdFromPlottrProFile(fileURL),
                      })
                    )

                    MPQ.projectEventStats(
                      'open_file',
                      {
                        online: navigator.onLine,
                        version: state.file.version,
                        number_open: numOpenFiles,
                      },
                      state
                    )

                    if (state && state.tour && state.tour.showTour)
                      store.dispatch(actions.ui.changeOrientation('horizontal'))

                    return machineId().then((clientId) => {
                      store.dispatch(actions.client.setClientId(clientId))

                      resolve()
                    })
                  },
                  logger
                )
              })
            })
          })
      })
  }

  function _bootFile(fileURL, options, numOpenFiles, saveBackup) {
    if (!helpers.file.isProtocolString(fileURL)) {
      const message = `Can't boot a file without a protocol: ${fileURL}`
      logger.error(message)
      store.dispatch(actions.applicationState.errorLoadingFile())
      return Promise.reject(new Error(message))
    }
    store.dispatch(actions.applicationState.startLoadingFile())

    // Now that we know what the file path for this window should be,
    // tell the main process.
    return setMyFilePath(fileURL).then(() => {
      // And then boot the file.
      const isCloudFile = isPlottrCloudFile(fileURL) && !bootingOfflineFile

      try {
        return (
          isCloudFile
            ? bootCloudFile(fileURL, saveBackup)
            : bootLocalFile(fileURL, numOpenFiles, saveBackup)
        )
          .then(() => {
            store.dispatch(actions.applicationState.finishLoadingFile())
          })
          .catch((error) => {
            logger.error(error)
            rollbar.error(error)
            store.dispatch(
              actions.applicationState.errorLoadingFile(error.message === 'Need to update Plottr')
            )
          })
      } catch (error) {
        logger.error(error)
        rollbar.error(error)
        store.dispatch(actions.applicationState.errorLoadingFile())
        return Promise.reject(error)
      }
    })
  }

  return _bootFile(fileURL, options, numOpenFiles, saveBackup).then(() => {
    if (saver) {
      saver.cancelAllRemainingRequests()
    }
    const postSaveHook = () => {
      store.dispatch(actions.ui.fileSaved())
    }
    const postBackupHook = () => {
      // NOP
    }
    saver = new Saver(
      () => {
        return store.getState().present
      },
      saveFile(whenClientIsReady, logger, postSaveHook),
      backupFile(
        whenClientIsReady,
        saveBackupOnFirebase,
        cachedDowloadStorageImage.downloadStorageImage,
        logger,
        postBackupHook
      ),
      logger,
      SAVE_INTERVAL_MS,
      BACKUP_INTERVAL_MS,
      rollbar,
      (title, message) => {
        showMessageBox(title, message)
      },
      (title, message) => {
        showErrorBox(title, message)
      },
      isRestarting
    )
  })
}

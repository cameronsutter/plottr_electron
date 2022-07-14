import { WebSocketServer } from 'ws'
import fs from 'fs'

import {
  FILE_BASENAME,
  PING,
  READ_FILE,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
  BACKUP_FILE,
  AUTO_SAVE_FILE,
  SAVE_BACKUP_ERROR,
  SAVE_BACKUP_SUCCESS,
  ENSURE_BACKUP_FULL_PATH,
  ENSURE_BACKUP_TODAY_PATH,
  FILE_EXISTS,
  BACKUP_OFFLINE_BACKUP_FOR_RESUME,
  READ_OFFLINE_FILES,
  CURRENT_TRIAL,
  START_TRIAL,
  EXTEND_TRIAL_WITH_RESET,
  CURRENT_LICENSE,
  DELETE_LICENSE,
  SAVE_LICENSE_INFO,
  CURRENT_KNOWN_FILES,
  CURRENT_TEMPLATES,
  CURRENT_CUSTOM_TEMPLATES,
  CURRENT_TEMPLATE_MANIFEST,
  CURRENT_EXPORT_CONFIG_SETTINGS,
  SAVE_EXPORT_CONFIG_SETTINGS,
  CURRENT_APP_SETTINGS,
  SAVE_APP_SETTING,
  CURRENT_USER_SETTINGS,
  CURRENT_BACKUPS,
  LISTEN_TO_TRIAL_CHANGES,
  LISTEN_TO_LICENSE_CHANGES,
  LISTEN_TO_KNOWN_FILES_CHANGES,
  LISTEN_TO_TEMPLATES_CHANGES,
  LISTEN_TO_CUSTOM_TEMPLATES_CHANGES,
  LISTEN_TO_TEMPLATE_MANIFEST_CHANGES,
  LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES,
  LISTEN_TO_APP_SETTINGS_CHANGES,
  LISTEN_TO_USER_SETTINGS_CHANGES,
  LISTEN_TO_BACKUPS_CHANGES,
  LISTEN_TO_TRIAL_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_LICENSE_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_KNOWN_FILES_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_TEMPLATES_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_CUSTOM_TEMPLATES_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_TEMPLATE_MANIFEST_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_APP_SETTINGS_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_USER_SETTINGS_CHANGES_UNSUBSCRIBE,
  LISTEN_TO_BACKUPS_CHANGES_UNSUBSCRIBE,
  IS_TEMP_FILE,
} from '../../shared/socket-server-message-types'
import { makeLogger } from './logger'
import FileModule from './files'
import BackupModule from './backup'
import fileSystemModule from './file-system'

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
  }
}

const { rm } = fs.promises

const setupListeners = (port, userDataPath) => {
  process.send(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port })
  const unsubscribeFunctions = new Map()

  const testModules = () => {
    const consoleLogger = {
      info: (...args) => {
        console.log(...args)
      },
      warn: (...args) => {
        console.warn(...args)
      },
      error: (...args) => {
        console.error(...args)
      },
    }
    FileModule(userDataPath, consoleLogger)
    BackupModule(userDataPath, consoleLogger)
    fileSystemModule(userDataPath, consoleLogger)
  }

  webSocketServer.on('connection', (webSocket) => {
    const logger = makeLogger(webSocket)
    const {
      saveFile,
      saveOfflineFile,
      basename,
      readFile,
      autoSave,
      fileExists,
      backupOfflineBackupForResume,
      readOfflineFiles,
      isTempFile,
    } = FileModule(userDataPath, logger)
    const { saveBackup, ensureBackupTodayPath } = BackupModule(userDataPath, logger)
    const {
      listenToTrialChanges,
      currentTrial,
      startTrial,
      extendTrialWithReset,
      listenToLicenseChanges,
      currentLicense,
      deleteLicense,
      saveLicenseInfo,
      listenToknownFilesChanges,
      currentKnownFiles,
      listenToTemplatesChanges,
      currentTemplates,
      listenToCustomTemplatesChanges,
      currentCustomTemplates,
      listenToTemplateManifestChanges,
      currentTemplateManifest,
      listenToExportConfigSettingsChanges,
      currentExportConfigSettings,
      saveExportConfigSettings,
      listenToAppSettingsChanges,
      currentAppSettings,
      saveAppSetting,
      listenToUserSettingsChanges,
      currentUserSettings,
      listenToBackupsChanges,
      currentBackups,
    } = fileSystemModule(userDataPath, logger)

    webSocket.on('message', (message) => {
      try {
        const { type, messageId, payload } = JSON.parse(message)

        const send = (type, ...args) => {
          try {
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                result: args,
                payload,
              })
            )
          } catch (error) {
            logger.error('Error sending a message back to the socket client')
          }
        }

        const typeToErrorReplyType = (type) => {
          return `${type}_ERROR_REPLY`
        }

        const replyWithErrorMessage = (errorMessage) => {
          webSocket.send(
            JSON.stringify({
              type: typeToErrorReplyType(type),
              messageId,
              payload,
              result: errorMessage,
            })
          )
        }

        // TODO: this code is repetative.  We might be able to do much
        // better.
        switch (type) {
          case PING: {
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                payload,
              })
            )
            return
          }
          case SAVE_FILE: {
            const { filePath, file } = payload
            logger.info('Saving (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
              filePath: filePath,
            })
            saveFile(filePath, file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving file ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case RM_RF: {
            logger.info('Deleting: ', payload)
            rm(payload.path, { recursive: true })
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    payload,
                    result,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while deleting ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case SAVE_OFFLINE_FILE: {
            logger.info('Saving offline file (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
            })
            const { file } = payload
            saveOfflineFile(file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving offline ', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case FILE_BASENAME: {
            logger.info('Computing basename for: ', payload)
            const { filePath } = payload
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                result: basename(filePath),
                payload,
              })
            )
            return
          }
          case READ_FILE: {
            logger.info('Reading a file at path: ', payload)
            const { filePath } = payload
            readFile(filePath)
              .then((fileData) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result: JSON.parse(fileData),
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while reading a file', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case BACKUP_FILE: {
            const { filePath, file } = payload
            logger.info('Backing up file (reduced payload): ', {
              file: {
                ...file.file,
              },
              filePath: filePath,
            })
            saveBackup(filePath, file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
                send(SAVE_BACKUP_SUCCESS, filePath)
              })
              .catch((error) => {
                logger.error('Error while saving a backup ', payload.file.file, error)
                send(SAVE_BACKUP_ERROR, filePath, error.message)
              })
            return
          }
          case AUTO_SAVE_FILE: {
            const { filePath, file, userId, previousFile } = payload
            logger.info('Auto-saving file (reduced payload): ', {
              file: {
                ...file.file,
              },
              filePath,
              previousFile: {
                ...previousFile.file,
              },
              userId,
            })
            autoSave(send, filePath, file, userId, previousFile)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while auto saving', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case ENSURE_BACKUP_FULL_PATH: {
            logger.info(
              'Ensuring that the full backup path exists (same op. as ensuring backup path for today.)'
            )
            ensureBackupTodayPath()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error ensuring the full backup path exists', error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case ENSURE_BACKUP_TODAY_PATH: {
            logger.info('Ensuring that the backup path exists for today.')
            ensureBackupTodayPath()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result: result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error ensuring the backup path for today', error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case FILE_EXISTS: {
            const { filePath } = payload
            logger.info(`Checking whether a file exists at: ${filePath}`)
            fileExists(filePath)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result: result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while checking whether a file exists', filePath, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case BACKUP_OFFLINE_BACKUP_FOR_RESUME: {
            logger.info('Backing up offline file for resume (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
            })
            const { file } = payload
            backupOfflineBackupForResume(file)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving offline backup file for resuming', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case READ_OFFLINE_FILES: {
            logger.info('Reading offline files.')
            readOfflineFiles()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while reading offline files', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case IS_TEMP_FILE: {
            const { file } = payload
            logger.info('Checking whether file is a temp file (reduced payload): ', {
              file: {
                ...payload.file.file,
              },
            })
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                result: isTempFile(file),
                payload,
              })
            )
            return
          }
          // ===File System APIs===
          case CURRENT_TRIAL: {
            logger.info('Getting the current trial info')
            currentTrial()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting the current trial', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case START_TRIAL: {
            const { numDays } = payload
            logger.info(`Starting trial for length: ${numDays}`)
            startTrial(numDays)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while starting the trial', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case EXTEND_TRIAL_WITH_RESET: {
            const { days } = payload
            logger.info(`Attempting to extend trial with reset for days: ${days}`)
            extendTrialWithReset(days)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while extending trial with reset', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_LICENSE: {
            logger.info('Fetching the current license data')
            currentLicense()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while extending trial with reset', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case DELETE_LICENSE: {
            logger.info('Deleting the license')
            deleteLicense()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while deleting the license', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case SAVE_LICENSE_INFO: {
            const { newLicense } = payload
            logger.info(
              'Setting the license to a new one.  Not displaying because it is sensitive.'
            )
            saveLicenseInfo(newLicense)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while saving the license', error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_KNOWN_FILES: {
            logger.info('Getting the current list of known files')
            currentKnownFiles()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting the current list of known files', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_TEMPLATES: {
            logger.info('Getting the current list of (official) templates')
            currentTemplates()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error(
                  'Error while getting the current list of (official) templates',
                  payload,
                  error
                )
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_CUSTOM_TEMPLATES: {
            logger.info('Getting the current list of custom templates')
            currentCustomTemplates()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error getting the current list of custom templates', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_TEMPLATE_MANIFEST: {
            logger.info('Getting the current template manifest')
            currentTemplateManifest()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting the current template manifest', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_EXPORT_CONFIG_SETTINGS: {
            logger.info('Getting the current export configuration settings')
            currentExportConfigSettings()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error(
                  'Error while getting the current export configuration settings',
                  payload,
                  error
                )
                replyWithErrorMessage(error.message)
              })
            return
          }
          case SAVE_EXPORT_CONFIG_SETTINGS: {
            const { key, value } = payload
            logger.info(`Setting ${key} to ${value} in export settings`)
            saveExportConfigSettings(key, value)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error(
                  `Error while setting ${key} to ${value} in export settings`,
                  payload,
                  error
                )
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_APP_SETTINGS: {
            currentAppSettings()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting the current app settings', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case SAVE_APP_SETTING: {
            const { key, value } = payload
            logger.info(`Setting ${key} to ${value} in app settings`)
            saveAppSetting(key, value)
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error(
                  `Error while setting ${key} to ${value} in app settings`,
                  payload,
                  error
                )
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_USER_SETTINGS: {
            logger.info('Getting current user settings')
            currentUserSettings()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting the current user settings', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          case CURRENT_BACKUPS: {
            logger.info('Getting the current backups')
            currentBackups()
              .then((result) => {
                webSocket.send(
                  JSON.stringify({
                    type,
                    messageId,
                    result,
                    payload,
                  })
                )
              })
              .catch((error) => {
                logger.error('Error while getting current backups', payload, error)
                replyWithErrorMessage(error.message)
              })
            return
          }
          // Subscriptions
          case LISTEN_TO_TRIAL_CHANGES: {
            logger.info('Listening to trial changes')
            const unsubscribe = listenToTrialChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_LICENSE_CHANGES: {
            logger.info('Listening to license changes')
            const unsubscribe = listenToLicenseChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_KNOWN_FILES_CHANGES: {
            logger.info('Listening to known files changes')
            const unsubscribe = listenToknownFilesChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_TEMPLATES_CHANGES: {
            logger.info('Listening to known (official) templates changes')
            const unsubscribe = listenToTemplatesChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_CUSTOM_TEMPLATES_CHANGES: {
            logger.info('Listening to custom template changes')
            const unsubscribe = listenToCustomTemplatesChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_TEMPLATE_MANIFEST_CHANGES: {
            logger.info('Listening to template manifest changes')
            const unsubscribe = listenToTemplateManifestChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES: {
            logger.info('Listening to export config settings changes')
            const unsubscribe = listenToExportConfigSettingsChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_APP_SETTINGS_CHANGES: {
            logger.info('Listening to app settings changes')
            const unsubscribe = listenToAppSettingsChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_USER_SETTINGS_CHANGES: {
            logger.info('Listening to user settings changes')
            const unsubscribe = listenToUserSettingsChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_BACKUPS_CHANGES: {
            logger.info('Listening to backups changes')
            const unsubscribe = listenToBackupsChanges((result) => {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            })
            unsubscribeFunctions.set(messageId, unsubscribe)
            return
          }
          case LISTEN_TO_TRIAL_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_LICENSE_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_KNOWN_FILES_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_TEMPLATES_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_CUSTOM_TEMPLATES_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_TEMPLATE_MANIFEST_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_APP_SETTINGS_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_USER_SETTINGS_CHANGES_UNSUBSCRIBE:
          case LISTEN_TO_BACKUPS_CHANGES_UNSUBSCRIBE: {
            const unsubscribe = unsubscribeFunctions.get(messageId)
            if (!unsubscribe) {
              logger.error(
                `Tried to unsubscribe from ${type} with a message id of ${messageId} but it's either already been done or never existed`
              )
              return
            }
            unsubscribe()
            unsubscribeFunctions.delete(messageId)
            return
          }
        }
      } catch (error) {
        logger.error('Failed to handle message: ', message.toString().substring(0, 50), error)
      }
    })
  })

  testModules()
  process.send('ready')
}

const startServer = () => {
  const { port, userDataPath } = parseArgs()
  process.send(`args: ${process.argv}`)
  setupListeners(port, userDataPath)
}

startServer()

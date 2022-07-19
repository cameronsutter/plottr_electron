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
  BACKUP_BASE_PATH,
  SET_TEMPLATE,
  SET_CUSTOM_TEMPLATE,
  DELETE_CUSTOM_TEMPLATE,
  DEFAULT_BACKUP_LOCATION,
  OFFLINE_FILE_PATH,
  CUSTOM_TEMPLATES_PATH,
  ATTEMPT_TO_FETCH_TEMPLATES,
} from '../../shared/socket-server-message-types'
import { makeLogger } from './logger'
import wireupFileModule from './files'
import wireupBackupModule from './backup'
import wireupFileSystemModule from './file-system'
import wireupTemplateFetcher from './template_fetcher'
import makeStores from './stores'
import makeSettingsModule from './settings'

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
  }
}

const { rm } = fs.promises

const startupTasks = (userDataPath, stores, logInfo) => {
  wireupTemplateFetcher(userDataPath)(stores, logInfo).fetch()
  return Promise.resolve()
}

const setupListeners = (port, userDataPath) => {
  process.send(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port })
  const unsubscribeFunctions = new Map()
  const logInfo = (...args) => {
    process.send(`[Socket Server]: Basic Log Info ${args.join(', ')}`)
  }

  const basicLogger = {
    info: logInfo,
    warn: logInfo,
    error: logInfo,
  }

  const stores = makeStores(userDataPath, basicLogger)
  const settings = makeSettingsModule(stores)

  const makeFileModule = wireupFileModule(userDataPath)
  const makeBackupModule = wireupBackupModule(userDataPath)
  const makeFileSystemModule = wireupFileSystemModule(userDataPath)
  const makeTemplateFetcher = wireupTemplateFetcher(userDataPath)

  const testModules = () => {
    const backupModule = makeBackupModule(settings, basicLogger)
    makeFileSystemModule(stores, basicLogger)
    makeTemplateFetcher(stores, basicLogger)
    makeFileModule(backupModule, settings, basicLogger)
  }

  webSocketServer.on('connection', (webSocket) => {
    const logger = makeLogger(webSocket)
    const backupModule = makeBackupModule(settings, logger)
    const { defaultBackupPath, saveBackup, ensureBackupTodayPath } = backupModule
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
      offlineFilesFilesPath,
    } = makeFileModule(backupModule, settings, logger)
    const {
      backupBasePath,
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
      setCustomTemplate,
      deleteCustomTemplate,
      setTemplate,
      customTemplatesPath,
    } = makeFileSystemModule(stores, logger)
    const attemptToFetchTemplates = () => {
      wireupTemplateFetcher(userDataPath)(stores, logInfo).fetch()
    }

    webSocket.on('message', (message) => {
      try {
        const { type, messageId, payload } = JSON.parse(message)

        const send = (messageType, ...args) => {
          try {
            webSocket.send(
              JSON.stringify({
                messageType,
                messageId,
                result: args,
                payload,
              })
            )
          } catch (error) {
            logger.error('Error sending a message back to the socket client')
          }
        }

        const typeToErrorReplyType = (messageType) => {
          return `${messageType}_ERROR_REPLY`
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

        const handleSync = (logBefore, handlePayload, logError) => {
          const toLogAsInfo = logBefore()
          logger.info(...(Array.isArray(toLogAsInfo) ? toLogAsInfo : [toLogAsInfo]))
          try {
            webSocket.send(
              JSON.stringify({
                type,
                messageId,
                payload,
                result: handlePayload(),
              })
            )
          } catch (error) {
            const toLogAsError = logError(error)
            logger.error([
              ...(Array.isArray(toLogAsError) ? toLogAsError : [toLogAsError]),
              error.message,
              error.stack,
            ])
            replyWithErrorMessage(error.message)
          }
        }

        const handlePromise = (logBefore, handlePayload, logError) => {
          const toLogAsInfo = logBefore()
          logger.info(...(Array.isArray(toLogAsInfo) ? toLogAsInfo : [toLogAsInfo]))
          handlePayload()
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
              const toLogAsError = logError(error)
              logger.error([
                ...(Array.isArray(toLogAsError) ? toLogAsError : [toLogAsError]),
                error.message,
                error.stack,
              ])
              replyWithErrorMessage(error.message)
            })
        }

        const handleSubscription = (logBefore, listen, logError) => {
          const toLogAsInfo = logBefore()
          logger.info(...(Array.isArray(toLogAsInfo) ? toLogAsInfo : [toLogAsInfo]))
          const unsubscribe = listen((result, error) => {
            if (error) {
              const toLogAsError = logError(error)
              logger.error([
                ...(Array.isArray(toLogAsError) ? toLogAsError : [toLogAsError]),
                error.message,
                error.stack,
              ])
            } else {
              webSocket.send(
                JSON.stringify({
                  type,
                  messageId,
                  result,
                  payload,
                })
              )
            }
          })
          unsubscribeFunctions.set(messageId, unsubscribe)
          return unsubscribe
        }

        switch (type) {
          case PING: {
            return handleSync(
              () => true,
              () => 'PING',
              (error) => 'PING failed'
            )
          }
          case SAVE_FILE: {
            const { filePath, file } = payload
            return handlePromise(
              () => [
                'Saving (reduced payload): ',
                {
                  file: {
                    ...payload.file.file,
                  },
                  filePath: filePath,
                },
              ],
              () => saveFile(filePath, file),
              (error) => ['Error while saving file ', payload]
            )
          }
          case RM_RF: {
            const path = payload
            return handlePromise(
              () => ['Deleting: ', payload],
              () => rm(path, { recursive: true }),
              (error) => ['Error while deleting ', payload]
            )
          }
          case SAVE_OFFLINE_FILE: {
            const { file } = payload
            return handlePromise(
              () => [
                'Saving offline file (reduced payload): ',
                {
                  file: {
                    ...file.file,
                  },
                },
              ],
              () => saveOfflineFile(file),
              (error) => ['Error while saving offline ', payload]
            )
          }
          case FILE_BASENAME: {
            const { filePath } = payload
            return handleSync(
              () => ['Computing basename for: ', filePath],
              () => basename(filePath),
              () => ['Error computing the basename for: ', filePath]
            )
          }
          case READ_FILE: {
            const { filePath } = payload
            return handlePromise(
              () => ['Reading a file at path: ', filePath],
              () => readFile(filePath),
              () => ['Error while reading a file: ', payload]
            )
          }
          case BACKUP_FILE: {
            const { filePath, file } = payload
            return handlePromise(
              () => [
                'Backing up file (reduced payload): ',
                {
                  file: {
                    ...file.file,
                  },
                  filePath: filePath,
                },
              ],
              () => saveBackup(filePath, file),
              () => ['Error while saving a backup ', payload.file.file]
            )
          }
          case AUTO_SAVE_FILE: {
            const { filePath, file, userId, previousFile } = payload
            return handlePromise(
              () => [
                'Auto-saving file (reduced payload): ',
                {
                  file: {
                    ...file.file,
                  },
                  filePath,
                  previousFile: {
                    ...previousFile.file,
                  },
                  userId,
                },
              ],
              () => autoSave(send, filePath, file, userId, previousFile),
              () => ['Error while auto saving', payload]
            )
          }
          case ENSURE_BACKUP_FULL_PATH: {
            return handlePromise(
              () =>
                'Ensuring that the full backup path exists (same op. as ensuring backup path for today.)',
              ensureBackupTodayPath,
              () => 'Error ensuring the full backup path exists'
            )
          }
          case ENSURE_BACKUP_TODAY_PATH: {
            return handlePromise(
              () => 'Ensuring that the backup path exists for today.',
              ensureBackupTodayPath,
              () => 'Error ensuring the backup path for today'
            )
          }
          case FILE_EXISTS: {
            const { filePath } = payload
            return handlePromise(
              () => `Checking whether a file exists at: ${filePath}`,
              () => fileExists(filePath),
              () => ['Error while checking whether a file exists', filePath]
            )
          }
          case BACKUP_OFFLINE_BACKUP_FOR_RESUME: {
            const { file } = payload
            return handlePromise(
              () => [
                'Backing up offline file for resume (reduced payload): ',
                {
                  file: {
                    ...payload.file.file,
                  },
                },
              ],
              () => backupOfflineBackupForResume(file),
              () => ['Error while saving offline backup file for resuming', payload]
            )
          }
          case READ_OFFLINE_FILES: {
            return handlePromise(
              () => 'Reading offline files.',
              readOfflineFiles,
              () => ['Error while reading offline files', payload]
            )
          }
          case IS_TEMP_FILE: {
            const { file } = payload
            return handleSync(
              () => [
                'Checking whether file is a temp file (reduced payload): ',
                {
                  file: {
                    ...payload.file.file,
                  },
                },
              ],
              () => isTempFile(file),
              () => ['Error checking where file is temp: ', file]
            )
          }
          case SET_TEMPLATE: {
            const { id, template } = payload
            return handlePromise(
              () => `Setting a template with id ${id} to ${template}`,
              () => setTemplate(id, template),
              () => [`Error while setting a template with id ${id} to ${template}`, payload]
            )
          }
          case SET_CUSTOM_TEMPLATE: {
            const { id, template } = payload
            return handlePromise(
              () => `Setting a custom template with id ${id} to ${template}`,
              () => setCustomTemplate(id, template),
              () => [`Error while setting a custom template with id ${id} to ${template}`, payload]
            )
          }
          case DELETE_CUSTOM_TEMPLATE: {
            const { id } = payload
            return handlePromise(
              () => `Deleting a custom template with id ${id}`,
              () => deleteCustomTemplate(id),
              () => [`Error while deleting a custom template with id ${id}`, payload]
            )
          }
          case DEFAULT_BACKUP_LOCATION: {
            return handleSync(
              () => 'Getting the default backup location',
              () => defaultBackupPath,
              () => 'Error getting the default backup path'
            )
          }
          case OFFLINE_FILE_PATH: {
            return handleSync(
              () => 'Getting the offline file path',
              () => offlineFilesFilesPath,
              () => 'Error getting the offline file path'
            )
          }
          case ATTEMPT_TO_FETCH_TEMPLATES: {
            return handleSync(
              () =>
                'Attempting to fetch latest templates (might not if the manifest is up to date)',
              attemptToFetchTemplates,
              () => 'Error attempting to fetch the latest templates'
            )
          }
          // ===File System APIs===
          case CUSTOM_TEMPLATES_PATH: {
            return handleSync(
              () => 'Getting the custom templates path',
              () => customTemplatesPath,
              () => 'Error getting the custom templates path'
            )
          }
          case BACKUP_BASE_PATH: {
            return handlePromise(
              () => 'Getting the backup base path',
              backupBasePath,
              () => 'Error while getting the backup base path'
            )
          }
          case CURRENT_TRIAL: {
            return handlePromise(
              () => 'Getting the current trial info',
              currentTrial,
              () => 'Error while getting the current trial'
            )
          }
          case START_TRIAL: {
            const { numDays } = payload
            return handlePromise(
              () => `Starting trial for length: ${numDays}`,
              () => startTrial(numDays),
              () => ['Error while starting the trial', payload]
            )
          }
          case EXTEND_TRIAL_WITH_RESET: {
            const { days } = payload
            return handlePromise(
              () => `Attempting to extend trial with reset for days: ${days}`,
              () => extendTrialWithReset(days),
              () => ['Error while extending trial with reset', payload]
            )
          }
          case CURRENT_LICENSE: {
            return handlePromise(
              () => 'Fetching the current license data',
              currentLicense,
              () => 'Error while extending trial with reset'
            )
          }
          case DELETE_LICENSE: {
            return handlePromise(
              () => 'Deleting the license',
              deleteLicense,
              () => 'Error while deleting the license'
            )
          }
          case SAVE_LICENSE_INFO: {
            const { newLicense } = payload
            return handlePromise(
              () => 'Setting the license to a new one.  Not displaying because it is sensitive.',
              () => saveLicenseInfo(newLicense),
              () => 'Error while saving the license'
            )
          }
          case CURRENT_KNOWN_FILES: {
            return handlePromise(
              () => 'Getting the current list of known files',
              currentKnownFiles,
              () => 'Error while getting the current list of known files'
            )
          }
          case CURRENT_TEMPLATES: {
            return handlePromise(
              () => 'Getting the current list of (official) templates',
              currentTemplates,
              () => 'Error while getting the current list of (official) templates'
            )
          }
          case CURRENT_CUSTOM_TEMPLATES: {
            return handlePromise(
              () => 'Getting the current list of custom templates',
              currentCustomTemplates,
              () => 'Error getting the current list of custom templates'
            )
          }
          case CURRENT_TEMPLATE_MANIFEST: {
            return handlePromise(
              () => 'Getting the current template manifest',
              currentTemplateManifest,
              () => 'Error while getting the current template manifest'
            )
          }
          case CURRENT_EXPORT_CONFIG_SETTINGS: {
            return handlePromise(
              () => 'Getting the current export configuration settings',
              currentExportConfigSettings,
              () => 'Error while getting the current export configuration settings'
            )
          }
          case SAVE_EXPORT_CONFIG_SETTINGS: {
            const { key, value } = payload
            return handlePromise(
              () => `Setting ${key} to ${value} in export settings`,
              () => saveExportConfigSettings(key, value),
              () => `Error while setting ${key} to ${value} in export settings`
            )
          }
          case CURRENT_APP_SETTINGS: {
            return handlePromise(
              () => 'Getting the current app settings',
              currentAppSettings,
              () => 'Error while getting the current app settings'
            )
          }
          case SAVE_APP_SETTING: {
            const { key, value } = payload
            return handlePromise(
              () => `Setting ${key} to ${value} in app settings`,
              () => saveAppSetting(key, value),
              () => `Error while setting ${key} to ${value} in app settings`
            )
          }
          case CURRENT_USER_SETTINGS: {
            return handlePromise(
              () => 'Getting current user settings',
              currentUserSettings,
              () => 'Error while getting the current user settings'
            )
          }
          case CURRENT_BACKUPS: {
            return handlePromise(
              () => 'Getting the current backups',
              currentBackups,
              () => 'Error while getting current backups'
            )
          }
          // Subscriptions
          case LISTEN_TO_TRIAL_CHANGES: {
            return handleSubscription(
              () => 'Listening to trial changes',
              listenToTrialChanges,
              () => 'Error listening to trial changes'
            )
          }
          case LISTEN_TO_LICENSE_CHANGES: {
            return handleSubscription(
              () => 'Listening to license changes',
              listenToLicenseChanges,
              () => 'Error listening to license changes'
            )
          }
          case LISTEN_TO_KNOWN_FILES_CHANGES: {
            return handleSubscription(
              () => 'Listening to known files changes',
              listenToknownFilesChanges,
              () => 'Error listening to known files changes'
            )
          }
          case LISTEN_TO_TEMPLATES_CHANGES: {
            return handleSubscription(
              () => 'Listening to known (official) templates changes',
              listenToTemplatesChanges,
              () => 'Error listening to known (official) templates changes'
            )
          }
          case LISTEN_TO_CUSTOM_TEMPLATES_CHANGES: {
            return handleSubscription(
              () => 'Listening to custom template changes',
              listenToCustomTemplatesChanges,
              () => 'Error listening to custom template changes'
            )
          }
          case LISTEN_TO_TEMPLATE_MANIFEST_CHANGES: {
            return handleSubscription(
              () => 'Listening to template manifest changes',
              listenToTemplateManifestChanges,
              () => 'Error listening to template manifest changes'
            )
          }
          case LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES: {
            return handleSubscription(
              () => 'Listening to export config settings changes',
              listenToExportConfigSettingsChanges,
              () => 'Error listening to export config settings changes'
            )
          }
          case LISTEN_TO_APP_SETTINGS_CHANGES: {
            return handleSubscription(
              () => 'Listening to app settings changes',
              listenToAppSettingsChanges,
              () => 'Error listening to app settings changes'
            )
          }
          case LISTEN_TO_USER_SETTINGS_CHANGES: {
            return handleSubscription(
              () => 'Listening to user settings changes',
              listenToUserSettingsChanges,
              () => 'Error listening to user settings changes'
            )
          }
          case LISTEN_TO_BACKUPS_CHANGES: {
            return handleSubscription(
              () => 'Listening to backups changes',
              listenToBackupsChanges,
              () => 'Error listening to backups changes'
            )
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
              return false
            }
            unsubscribe()
            unsubscribeFunctions.delete(messageId)
            return true
          }
        }
        return false
      } catch (error) {
        logger.error(
          'Failed to handle message: ',
          message.toString().substring(0, 50),
          error.message,
          error.stack,
          error
        )
        return false
      }
    })
  })

  testModules()
  startupTasks(userDataPath, stores, logInfo).then(() => {
    process.send('ready')
  })
}

const startServer = () => {
  const { port, userDataPath } = parseArgs()
  process.send(`args: ${process.argv}`)
  setupListeners(port, userDataPath)
}

startServer()

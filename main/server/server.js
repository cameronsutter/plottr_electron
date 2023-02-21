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
  SAVE_BACKUP_ERROR,
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
  SAVE_AS_TEMP_FILE,
  REMOVE_FROM_KNOWN_FILES,
  ADD_KNOWN_FILE,
  EDIT_KNOWN_FILE_PATH,
  UPDATE_LAST_OPENED_DATE,
  ADD_KNOWN_FILE_WITH_FIX,
  DELETE_KNOWN_FILE,
  REMOVE_FROM_TEMP_FILES,
  SAVE_TO_TEMP_FILE,
  LAST_OPENED_FILE,
  SET_LAST_OPENED_FILE,
  COPY_FILE,
  UPDATE_KNOWN_FILE_NAME,
  NUKE_LAST_OPENED_FILE_URL,
  SHUTDOWN,
  WRITE_FILE,
  JOIN,
  PATH_SEP,
  TRASH_FILE,
  EXTNAME,
  OFFLINE_FILE_URL,
  RESOLVE,
  READDIR,
  STAT,
  MKDIR,
  CREATE_SHORTCUT,
} from '../../shared/socket-server-message-types'
import { makeLogger } from './logger'
import wireupFileModule from './files'
import wireupBackupModule from './backup'
import wireupFileSystemModule from './file-system'
import wireupTemplateFetcher from './template_fetcher'
import makeStores from './stores'
import makeSettingsModule from './settings'
import makeKnownFilesModule from './knownFiles'
import makeTempFilesModule from './tempFiles'
import StatusManager from './StatusManager'
import makeTrashModule from './trash'

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
    isBetaOrAlpha: process.argv[4] === 'isBetaOrAlpha',
  }
}

const { rm, mkdir, lstat } = fs.promises

const startupTasks = (userDataPath, stores, logInfo) => {
  return wireupTemplateFetcher(userDataPath)(stores, logInfo).then((templateFetcher) => {
    return templateFetcher.fetch().catch((error) => {
      logInfo(
        `ERROR: couldn't fetch templates at startup.  Continueing anyway.  Error message: ${error.message}.\n${error.stack}`
      )
    })
  })
}

const ONE_GIGABYTE = 1073741824

const setupListeners = (port, userDataPath, isBetaOrAlpha) => {
  process.send(`Starting server on port: ${port}`)
  const webSocketServer = new WebSocketServer({ host: 'localhost', port, maxPayload: ONE_GIGABYTE })
  const unsubscribeFunctions = new Map()
  const logInfo = (...args) => {
    process.send(`[Socket Server]: Basic Log Info ${args.join(', ')}`)
  }

  const basicLogger = {
    info: logInfo,
    warn: logInfo,
    error: logInfo,
  }

  const stores = makeStores(userDataPath, basicLogger, isBetaOrAlpha)
  const settings = makeSettingsModule(stores)

  const makeFileModule = wireupFileModule(userDataPath)
  const makeBackupModule = wireupBackupModule(userDataPath)
  const makeFileSystemModule = wireupFileSystemModule(userDataPath)
  const makeTemplateFetcher = wireupTemplateFetcher(userDataPath)

  const ensureUserDataFolderExists = () => {
    return lstat(userDataPath).catch((error) => {
      if (error.code === 'ENOENT') {
        return mkdir(userDataPath, { recursive: true }).then(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
        })
      }
      return Promise.resolve()
    })
  }

  const testModules = () => {
    const backupModule = makeBackupModule(settings, basicLogger)
    makeFileSystemModule(stores, basicLogger)
    makeFileModule(backupModule, settings, basicLogger)
    return makeTemplateFetcher(stores, logInfo)
  }

  const statusManager = new StatusManager(basicLogger)

  webSocketServer.on('connection', (webSocket) => {
    statusManager.acceptConnection(webSocket)
    const logger = makeLogger(webSocket)
    const backupModule = makeBackupModule(settings, logger)
    const { defaultBackupPath, saveBackup, ensureBackupTodayPath } = backupModule
    const fileModule = makeFileModule(backupModule, settings, logger)
    const {
      saveFile,
      saveOfflineFile,
      basename,
      readFile,
      fileExists,
      backupOfflineBackupForResume,
      readOfflineFiles,
      isTempFile,
      offlineFilesFilesPath,
      saveTempFile,
      writeFile,
      join,
      separator,
      extname,
      resolvePath,
      offlineFileURL,
      stat,
      readdir,
      mkdir,
    } = fileModule
    const fileSystemModule = makeFileSystemModule(stores, logger)
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
      lastOpenedFile,
      setLastOpenedFilePath,
      copyFile,
      createFileShortcut,
    } = fileSystemModule
    const trashModule = makeTrashModule(userDataPath, logger)
    const { trashByURL } = trashModule
    const tempFilesModule = makeTempFilesModule(
      userDataPath,
      stores,
      fileModule,
      trashModule,
      logger
    )
    const { removeFromTempFiles, saveToTempFile } = tempFilesModule
    const {
      removeFromKnownFiles,
      addKnownFile,
      addKnownFileWithFix,
      editKnownFilePath,
      updateLastOpenedDate,
      deleteKnownFile,
      updateKnownFileName,
    } = makeKnownFilesModule(
      stores,
      fileModule,
      fileSystemModule,
      tempFilesModule,
      trashModule,
      backupModule,
      logger
    )
    const attemptToFetchTemplates = () => {
      return wireupTemplateFetcher(userDataPath)(stores, logInfo).then((templateFetcher) => {
        return templateFetcher.fetch()
      })
    }

    webSocket.on('message', (message) => {
      try {
        const { type, messageId, payload } = JSON.parse(message)

        const typeToErrorReplyType = (messageType) => {
          return `${messageType}_ERROR_REPLY`
        }

        const replyWithErrorMessage = (errorMessage) => {
          webSocket.send(
            JSON.stringify({
              type: typeToErrorReplyType(type),
              messageId,
              payload: 'truncated',
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
                payload: 'truncated',
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
                  payload: 'truncated',
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
                  payload: 'truncated',
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
            const { fileURL, file } = payload
            return handlePromise(
              () => [
                'Saving (reduced payload): ',
                {
                  file: {
                    ...payload.file.file,
                  },
                  fileURL: fileURL,
                },
              ],
              () => statusManager.registerTask(saveFile(fileURL, file), SAVE_FILE),
              (error) => [
                'Error while saving file ',
                {
                  file: {
                    ...payload?.file?.file,
                  },
                  fileURL: fileURL,
                },
              ]
            )
          }
          case RM_RF: {
            const { path } = payload
            return handlePromise(
              () => ['Deleting: ', payload],
              () => statusManager.registerTask(rm(path, { recursive: true }), RM_RF),
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
              () => statusManager.registerTask(saveOfflineFile(file), SAVE_OFFLINE_FILE),
              (error) => [
                'Error while saving offline ',
                {
                  file: {
                    ...file?.file,
                  },
                },
              ]
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
              () => statusManager.registerTask(saveBackup(filePath, file), BACKUP_FILE),
              () => ['Error while saving a backup ', payload?.file?.file]
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
              () =>
                statusManager.registerTask(
                  backupOfflineBackupForResume(file),
                  BACKUP_OFFLINE_BACKUP_FOR_RESUME
                ),
              () => [
                'Error while saving offline backup file for resuming',
                {
                  file: {
                    ...payload?.file?.file,
                  },
                },
              ]
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
                    ...payload?.file?.file,
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
              () => statusManager.registerTask(setTemplate(id, template), SET_TEMPLATE),
              () => [`Error while setting a template with id ${id} to ${template}`, payload]
            )
          }
          case SET_CUSTOM_TEMPLATE: {
            const { id, template } = payload
            return handlePromise(
              () => `Setting a custom template with id ${id} to ${template}`,
              () =>
                statusManager.registerTask(setCustomTemplate(id, template), SET_CUSTOM_TEMPLATE),
              () => [`Error while setting a custom template with id ${id} to ${template}`, payload]
            )
          }
          case DELETE_CUSTOM_TEMPLATE: {
            const { id } = payload
            return handlePromise(
              () => `Deleting a custom template with id ${id}`,
              () => statusManager.registerTask(deleteCustomTemplate(id), DELETE_CUSTOM_TEMPLATE),
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
          case OFFLINE_FILE_URL: {
            const { fileURL } = payload
            return handlePromise(
              () => ['Computing the offline file URL of', fileURL],
              () => statusManager.registerTask(offlineFileURL(fileURL), OFFLINE_FILE_URL),
              () => ['Error computing the offline file URL of', fileURL]
            )
          }
          case ATTEMPT_TO_FETCH_TEMPLATES: {
            return handlePromise(
              () =>
                'Attempting to fetch latest templates (might not if the manifest is up to date)',
              attemptToFetchTemplates,
              () => 'Error attempting to fetch the latest templates'
            )
          }
          case SAVE_AS_TEMP_FILE: {
            const { file } = payload
            return handlePromise(
              () => [
                'Saving file to temp folder: ',
                {
                  file: {
                    ...payload.file.file,
                  },
                },
              ],
              () => statusManager.registerTask(saveTempFile(file), SAVE_AS_TEMP_FILE),
              () => [
                'Error saving file to temp folder: ',
                {
                  file: {
                    ...payload?.file?.file,
                  },
                },
              ]
            )
          }
          case REMOVE_FROM_KNOWN_FILES: {
            const { fileURL } = payload
            return handlePromise(
              () => `Removing entry with fileURL ${fileURL} from known files`,
              () =>
                statusManager.registerTask(removeFromKnownFiles(fileURL), REMOVE_FROM_KNOWN_FILES),
              () => `Error removing entry with fileURL ${fileURL} from known files`
            )
          }
          case DELETE_KNOWN_FILE: {
            const { fileURL } = payload
            return handlePromise(
              () => `Deleting a known file with fileURL ${fileURL}`,
              () => statusManager.registerTask(deleteKnownFile(fileURL), DELETE_KNOWN_FILE),
              () => `Error deleting a known file with fileURL ${fileURL}`
            )
          }
          case UPDATE_KNOWN_FILE_NAME: {
            const { fileURL, newName } = payload
            return handlePromise(
              () => `Updating file name of known file record: ${fileURL} to ${newName}`,
              () =>
                statusManager.registerTask(
                  updateKnownFileName(fileURL, newName),
                  UPDATE_KNOWN_FILE_NAME
                ),
              () => `Error updating file name of known file record: ${fileURL} to ${newName}`
            )
          }
          case REMOVE_FROM_TEMP_FILES: {
            const { fileURL, doDelete } = payload
            return handlePromise(
              () => `Removing ${fileURL} from temp files (deleting? ${doDelete})`,
              () =>
                statusManager.registerTask(
                  removeFromTempFiles(fileURL, doDelete),
                  REMOVE_FROM_TEMP_FILES
                ),
              () => `Error removing ${fileURL} from temp files (deleting? ${doDelete})`
            )
          }
          case SAVE_TO_TEMP_FILE: {
            const { json, name } = payload
            return handlePromise(
              () => [
                `Saving to temp file named ${name} (reduced payload)`,
                {
                  file: {
                    ...json.file,
                  },
                },
              ],
              () => statusManager.registerTask(saveToTempFile(json, name), SAVE_TO_TEMP_FILE),
              () => [
                `Error saving to temp file named ${name} (reduced payload)`,
                {
                  file: {
                    ...json?.file,
                  },
                },
              ]
            )
          }
          case ADD_KNOWN_FILE_WITH_FIX: {
            const { fileURL } = payload
            return handlePromise(
              () => `Adding ${fileURL} to known files and fixing the store`,
              () =>
                statusManager.registerTask(addKnownFileWithFix(fileURL), ADD_KNOWN_FILE_WITH_FIX),
              () => `Error adding ${fileURL} to known files and fixing the store`
            )
          }
          case ADD_KNOWN_FILE: {
            const { fileURL } = payload
            return handlePromise(
              () => `Adding ${fileURL} to known files`,
              () => statusManager.registerTask(addKnownFile(fileURL), ADD_KNOWN_FILE),
              () => `Error adding ${fileURL} to known files`
            )
          }
          case EDIT_KNOWN_FILE_PATH: {
            const { oldFileURL, newFileURL } = payload
            return handlePromise(
              () => `Editing a known file's path from ${oldFileURL} to ${newFileURL}`,
              () =>
                statusManager.registerTask(
                  editKnownFilePath(oldFileURL, newFileURL),
                  EDIT_KNOWN_FILE_PATH
                ),
              () => `Error editing a known file's path from ${oldFileURL} to ${newFileURL}`
            )
          }
          case UPDATE_LAST_OPENED_DATE: {
            const { fileURL } = payload
            return handlePromise(
              () => `Updating the last opened date for file with id ${fileURL}`,
              () =>
                statusManager.registerTask(updateLastOpenedDate(fileURL), UPDATE_LAST_OPENED_DATE),
              () => `Error updating the last opened date for file with id ${fileURL}`
            )
          }
          case READDIR: {
            const { path } = payload
            return handlePromise(
              () => ['Reading the contents of', path],
              () => statusManager.registerTask(readdir(path), READDIR),
              () => ['Error reading the contents of', path]
            )
          }
          case STAT: {
            const { path } = payload
            return handlePromise(
              () => ['Reading the FS stats of', path],
              () => statusManager.registerTask(stat(path), STAT),
              () => ['Error reading the FS stats of', path]
            )
          }
          case MKDIR: {
            const { path } = payload
            return handlePromise(
              () => ['Creating a directory (recursively) at', path],
              () => statusManager.registerTask(mkdir(path), MKDIR),
              () => ['Error creating a directory (recursively) at', path]
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
          case COPY_FILE: {
            const { sourceFileURL, newFileURL } = payload
            return handlePromise(
              () => `Copying file from ${sourceFileURL} to ${newFileURL}`,
              () => copyFile(sourceFileURL, newFileURL),
              () => `Error copying file from ${sourceFileURL} to ${newFileURL}`
            )
          }
          case CREATE_SHORTCUT: {
            const { sourceFileURL, newFileURL } = payload
            return handlePromise(
              () => `Creating Shortcut from ${sourceFileURL} to ${newFileURL}`,
              () => createFileShortcut(sourceFileURL, newFileURL),
              () => `Error creating Shortcut from ${sourceFileURL} to ${newFileURL}`
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
              () => statusManager.registerTask(startTrial(numDays), START_TRIAL),
              () => ['Error while starting the trial', payload]
            )
          }
          case EXTEND_TRIAL_WITH_RESET: {
            const { days } = payload
            return handlePromise(
              () => `Attempting to extend trial with reset for days: ${days}`,
              () => statusManager.registerTask(extendTrialWithReset(days), EXTEND_TRIAL_WITH_RESET),
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
              () => statusManager.registerTask(saveLicenseInfo(newLicense), SAVE_LICENSE_INFO),
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
              () =>
                statusManager.registerTask(
                  saveExportConfigSettings(key, value),
                  SAVE_EXPORT_CONFIG_SETTINGS
                ),
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
              () => statusManager.registerTask(saveAppSetting(key, value), SAVE_APP_SETTING),
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
          case LAST_OPENED_FILE: {
            return handlePromise(
              () => 'Getting the last opened file',
              () => statusManager.registerTask(lastOpenedFile(), LAST_OPENED_FILE),
              () => 'Error while getting last opened file'
            )
          }
          case SET_LAST_OPENED_FILE: {
            const { filePath } = payload
            return handlePromise(
              () => 'Setting the last opened file',
              () =>
                statusManager.registerTask(setLastOpenedFilePath(filePath), SET_LAST_OPENED_FILE),
              () => 'Error while setting last opened file'
            )
          }
          case NUKE_LAST_OPENED_FILE_URL: {
            return handlePromise(
              () => 'Nuking the last opened file URL',
              () =>
                statusManager.registerTask(setLastOpenedFilePath(''), NUKE_LAST_OPENED_FILE_URL),
              () => 'Error nuking the last opened file URL'
            )
          }
          case SHUTDOWN: {
            return handlePromise(
              () => 'SHUTTING DOWN THE SOCKET SERVER',
              () =>
                statusManager.registerTask(
                  (() => {
                    process.send('shutdown')
                    return Promise.resolve()
                  })(),
                  SHUTDOWN
                ),
              () => 'ERROR SHUTTING DOWN THE SOCKET SERVER'
            )
          }
          case WRITE_FILE: {
            const { path, file, base64 } = payload
            const data = file || file === '' ? file : Buffer.from(base64, 'base64')
            return handlePromise(
              () => ['Writing a file to', path],
              () => statusManager.registerTask(writeFile(path, data), WRITE_FILE),
              () => ['Failed writing a file to', path]
            )
          }
          case JOIN: {
            const { pathArgs } = payload
            return handlePromise(
              () => ['Joining path args to create an OS path', pathArgs],
              () => statusManager.registerTask(join(...pathArgs), JOIN),
              () => ['Joining path args to create an OS path', pathArgs]
            )
          }
          case PATH_SEP: {
            return handleSync(
              () => 'Requested the path separator for the host operating system',
              () => separator,
              () => 'Error requesting the path separator for the host operating system'
            )
          }
          case TRASH_FILE: {
            const { fileURL } = payload
            return handlePromise(
              () => ['Trashing file at', fileURL],
              () => statusManager.registerTask(trashByURL(fileURL)),
              () => ['Error trashing file at', fileURL]
            )
          }
          case EXTNAME: {
            const { filePath } = payload
            return handleSync(
              () => ['Computing extname of', filePath],
              () => extname(filePath),
              () => ['Error computing extname of', filePath]
            )
          }
          case RESOLVE: {
            const { args } = payload
            return handleSync(
              () => ['Resolving a path for', args],
              () => resolvePath(...args),
              () => ['Error computing a path for', args]
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

  ensureUserDataFolderExists()
    .then(testModules)
    .then(() => {
      startupTasks(userDataPath, stores, logInfo).then(() => {
        process.send('ready')
      })
    })
}

const startServer = () => {
  const { port, userDataPath, isBetaOrAlpha } = parseArgs()
  process.send(`args: ${process.argv}`)
  setupListeners(port, userDataPath, isBetaOrAlpha)
}

startServer()

import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'

import {
  PING,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
  FILE_BASENAME,
  READ_FILE,
  AUTO_SAVE_FILE,
  BACKUP_FILE,
  SAVE_BACKUP_ERROR,
  SAVE_BACKUP_SUCCESS,
  AUTO_SAVE_ERROR,
  AUTO_SAVE_WORKED_THIS_TIME,
  AUTO_SAVE_BACKUP_ERROR,
  ENSURE_BACKUP_FULL_PATH,
  ENSURE_BACKUP_TODAY_PATH,
  LOG_INFO,
  LOG_WARN,
  LOG_ERROR,
  FILE_EXISTS,
  BACKUP_OFFLINE_BACKUP_FOR_RESUME,
  READ_OFFLINE_FILES,
  SET_TEMPLATE,
  SAVE_AS_TEMP_FILE,
  REMOVE_FROM_KNOWN_FILES,
  ADD_KNOWN_FILE,
  EDIT_KNOWN_FILE_PATH,
  UPDATE_LAST_OPENED_DATE,

  // Error reply types
  REMOVE_FROM_KNOWN_FILES_ERROR_REPLY,
  ADD_KNOWN_FILE_ERROR_REPLY,
  EDIT_KNOWN_FILE_PATH_ERROR_REPLY,
  UPDATE_LAST_OPENED_DATE_ERROR_REPLY,
  SAVE_AS_TEMP_FILE_ERROR_REPLY,
  RM_RF_ERROR_REPLY,
  SAVE_FILE_ERROR_REPLY,
  SAVE_OFFLINE_FILE_ERROR_REPLY,
  FILE_BASENAME_ERROR_REPLY,
  READ_FILE_ERROR_REPLY,
  BACKUP_FILE_ERROR_REPLY,
  AUTO_SAVE_FILE_ERROR_REPLY,
  ENSURE_BACKUP_FULL_PATH_ERROR_REPLY,
  ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY,
  FILE_EXISTS_ERROR_REPLY,
  BACKUP_OFFLINE_BACKUP_FOR_RESUME_ERROR_REPLY,
  READ_OFFLINE_FILES_ERROR_REPLY,
  CURRENT_TRIAL_ERROR_REPLY,
  START_TRIAL_ERROR_REPLY,
  EXTEND_TRIAL_WITH_RESET_ERROR_REPLY,
  CURRENT_LICENSE_ERROR_REPLY,
  DELETE_LICENSE_ERROR_REPLY,
  SAVE_LICENSE_INFO_ERROR_REPLY,
  CURRENT_KNOWN_FILES_ERROR_REPLY,
  CURRENT_TEMPLATES_ERROR_REPLY,
  CURRENT_CUSTOM_TEMPLATES_ERROR_REPLY,
  CURRENT_TEMPLATE_MANIFEST_ERROR_REPLY,
  CURRENT_EXPORT_CONFIG_SETTINGS_ERROR_REPLY,
  SAVE_EXPORT_CONFIG_SETTINGS_ERROR_REPLY,
  CURRENT_APP_SETTINGS_ERROR_REPLY,
  SAVE_APP_SETTING_ERROR_REPLY,
  CURRENT_USER_SETTINGS_ERROR_REPLY,
  CURRENT_BACKUPS_ERROR_REPLY,
  SET_TEMPLATE_ERROR_REPLY,

  // File system APIs
  LISTEN_TO_TRIAL_CHANGES,
  CURRENT_TRIAL,
  START_TRIAL,
  EXTEND_TRIAL_WITH_RESET,
  LISTEN_TO_LICENSE_CHANGES,
  CURRENT_LICENSE,
  DELETE_LICENSE,
  SAVE_LICENSE_INFO,
  LISTEN_TO_KNOWN_FILES_CHANGES,
  CURRENT_KNOWN_FILES,
  LISTEN_TO_TEMPLATES_CHANGES,
  CURRENT_TEMPLATES,
  LISTEN_TO_CUSTOM_TEMPLATES_CHANGES,
  CURRENT_CUSTOM_TEMPLATES,
  LISTEN_TO_TEMPLATE_MANIFEST_CHANGES,
  CURRENT_TEMPLATE_MANIFEST,
  LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES,
  CURRENT_EXPORT_CONFIG_SETTINGS,
  SAVE_EXPORT_CONFIG_SETTINGS,
  LISTEN_TO_APP_SETTINGS_CHANGES,
  CURRENT_APP_SETTINGS,
  SAVE_APP_SETTING,
  LISTEN_TO_USER_SETTINGS_CHANGES,
  CURRENT_USER_SETTINGS,
  LISTEN_TO_BACKUPS_CHANGES,
  CURRENT_BACKUPS,
  IS_TEMP_FILE,
  BACKUP_BASE_PATH,
  BACKUP_BASE_PATH_ERROR_REPLY,
  CUSTOM_TEMPLATES_PATH_ERROR_REPLY,
  SET_CUSTOM_TEMPLATE,
  DELETE_CUSTOM_TEMPLATE,
  DEFAULT_BACKUP_LOCATION,
  DEFAULT_BACKUP_LOCATION_ERROR_REPLY,
  OFFLINE_FILE_PATH_ERROR_REPLY,
  OFFLINE_FILE_PATH,
  CUSTOM_TEMPLATES_PATH,
  ATTEMPT_TO_FETCH_TEMPLATES,
  ATTEMPT_TO_FETCH_TEMPLATES_ERROR_REPLY,
  ADD_KNOWN_FILE_WITH_FIX,
  ADD_KNOWN_FILE_WITH_FIX_ERROR_REPLY,
  DELETE_KNOWN_FILE,
  DELETE_KNOWN_FILE_ERROR_REPLY,
  SAVE_TO_TEMP_FILE,
  REMOVE_FROM_TEMP_FILES,
  REMOVE_FROM_TEMP_FILES_ERROR_REPLY,
  SAVE_TO_TEMP_FILE_ERROR_REPLY,
  BUSY,
  DONE,
  LAST_OPENED_FILE,
  LAST_OPENED_FILE_ERROR_REPLY,
  SET_LAST_OPENED_FILE,
  SET_LAST_OPENED_FILE_ERROR_REPLY,
} from '../socket-server-message-types'
import { setPort, getPort } from './workerPort'

const defer =
  typeof process === 'object' && process.type === 'renderer'
    ? window.requestIdleCallback
    : (f) => {
        setTimeout(f, 0)
      }

const connect = (
  port,
  logger,
  {
    onSaveBackupError,
    onSaveBackupSuccess,
    onAutoSaveError,
    onAutoSaveWorkedThisTime,
    onAutoSaveBackupError,
    onBusy,
    onDone,
  }
) => {
  try {
    const clientConnection = new WebSocket(`ws://localhost:${port}`)
    const promises = new Map()
    const callbacks = new Map()

    const sendPromise = (type, payload) => {
      const messageId = uuidv4()
      const reply = new Promise((resolve, reject) => {
        try {
          clientConnection.send(
            JSON.stringify({
              type,
              messageId,
              payload,
            })
          )
          promises.set(messageId, { resolve, reject })
        } catch (error) {
          reject(error)
        }
      })
      return reply
    }
    const typeToUnsubscribeType = (type) => type + '_UNSUBSCRIBE'
    const registerCallback = (type, payload, callback) => {
      const messageId = uuidv4()
      callbacks.set(messageId, callback)
      const unsubscribe = () => {
        callbacks.delete(messageId)
        try {
          clientConnection.send(
            JSON.stringify({
              type: typeToUnsubscribeType(type),
              messageId,
              payload: {},
            })
          )
        } catch (error) {
          logger.error(`Error trying to unsubscribe from ${type} with payload: ${payload}`)
        }
      }
      try {
        clientConnection.send(
          JSON.stringify({
            type,
            messageId,
            payload,
          })
        )
        return unsubscribe
      } catch (error) {
        logger.error(`Error while registering a listener on ${type} with payload: ${payload}`)
        throw error
      }
    }

    clientConnection.on('message', (data) => {
      try {
        const { type, payload, messageId, result } = JSON.parse(data)
        const resolvePromise = () => {
          const unresolvedPromise = promises.get(messageId)
          if (!unresolvedPromise) {
            logger.error(
              `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
            )
            return
          }
          promises.delete(messageId)
          unresolvedPromise.resolve(result)
        }

        const rejectPromise = () => {
          const unresolvedPromise = promises.get(messageId)
          if (!unresolvedPromise) {
            logger.error(
              `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
            )
            return
          }
          promises.delete(messageId)
          unresolvedPromise.reject(result)
        }

        switch (type) {
          // Additional replies (i.e. these might happen in addition
          // to the normal/happy path):
          case SAVE_BACKUP_ERROR: {
            if (onSaveBackupError) {
              const [filePath, errorMessage] = result
              onSaveBackupError(filePath, errorMessage)
            }
            return
          }
          case SAVE_BACKUP_SUCCESS: {
            if (onSaveBackupSuccess) {
              const [filePath] = result
              onSaveBackupSuccess(filePath)
            }
            return
          }
          case AUTO_SAVE_ERROR: {
            if (onAutoSaveError) {
              const [filePath, errorMessage] = result
              onAutoSaveError(filePath, errorMessage)
            }
            return
          }
          case AUTO_SAVE_WORKED_THIS_TIME: {
            if (onAutoSaveWorkedThisTime) {
              onAutoSaveWorkedThisTime()
            }
            return
          }
          case AUTO_SAVE_BACKUP_ERROR: {
            if (onAutoSaveBackupError) {
              const [backupFilePath, backupErrorMessage] = result
              onAutoSaveBackupError(backupFilePath, backupErrorMessage)
            }
            return
          }
          // Subscription replies
          case LISTEN_TO_TRIAL_CHANGES:
          case LISTEN_TO_LICENSE_CHANGES:
          case LISTEN_TO_KNOWN_FILES_CHANGES:
          case LISTEN_TO_TEMPLATES_CHANGES:
          case LISTEN_TO_CUSTOM_TEMPLATES_CHANGES:
          case LISTEN_TO_TEMPLATE_MANIFEST_CHANGES:
          case LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES:
          case LISTEN_TO_APP_SETTINGS_CHANGES:
          case LISTEN_TO_USER_SETTINGS_CHANGES:
          case LISTEN_TO_BACKUPS_CHANGES: {
            const callback = callbacks.get(messageId)
            // We might get a late reply from the worker thread.  i.e. it
            // could reply after we unsubscribed on this side.  In that
            // case, there'll be no callback registered.
            if (callback) callback(result)
            return
          }
          // Normal replies
          case REMOVE_FROM_TEMP_FILES:
          case REMOVE_FROM_KNOWN_FILES:
          case SAVE_TO_TEMP_FILE:
          case DELETE_KNOWN_FILE:
          case ADD_KNOWN_FILE_WITH_FIX:
          case ADD_KNOWN_FILE:
          case EDIT_KNOWN_FILE_PATH:
          case UPDATE_LAST_OPENED_DATE:
          case SAVE_AS_TEMP_FILE:
          case ATTEMPT_TO_FETCH_TEMPLATES:
          case DELETE_CUSTOM_TEMPLATE:
          case OFFLINE_FILE_PATH:
          case DEFAULT_BACKUP_LOCATION:
          case SET_TEMPLATE:
          case SET_CUSTOM_TEMPLATE:
          case CUSTOM_TEMPLATES_PATH:
          case BACKUP_BASE_PATH:
          case IS_TEMP_FILE:
          case CURRENT_TRIAL:
          case START_TRIAL:
          case EXTEND_TRIAL_WITH_RESET:
          case CURRENT_LICENSE:
          case DELETE_LICENSE:
          case SAVE_LICENSE_INFO:
          case CURRENT_KNOWN_FILES:
          case CURRENT_TEMPLATES:
          case CURRENT_CUSTOM_TEMPLATES:
          case CURRENT_TEMPLATE_MANIFEST:
          case CURRENT_EXPORT_CONFIG_SETTINGS:
          case SAVE_EXPORT_CONFIG_SETTINGS:
          case CURRENT_APP_SETTINGS:
          case SAVE_APP_SETTING:
          case CURRENT_USER_SETTINGS:
          case CURRENT_BACKUPS:
          case READ_OFFLINE_FILES:
          case BACKUP_OFFLINE_BACKUP_FOR_RESUME:
          case FILE_EXISTS:
          case ENSURE_BACKUP_FULL_PATH:
          case ENSURE_BACKUP_TODAY_PATH:
          case AUTO_SAVE_FILE:
          case BACKUP_FILE:
          case READ_FILE:
          case FILE_BASENAME:
          case SAVE_OFFLINE_FILE:
          case SAVE_FILE:
          case RM_RF:
          case PING: {
            resolvePromise()
            return
          }
          case BUSY: {
            onBusy()
            return
          }
          case DONE: {
            onDone()
            return
          }
          // Logging
          case LOG_INFO: {
            logger.info(result, type)
            return
          }
          case LOG_WARN: {
            logger.warn(result, type)
            return
          }
          case LOG_ERROR: {
            logger.error(result, type)
            return
          }
          // Error return types
          case REMOVE_FROM_TEMP_FILES_ERROR_REPLY:
          case SAVE_TO_TEMP_FILE_ERROR_REPLY:
          case DELETE_KNOWN_FILE_ERROR_REPLY:
          case REMOVE_FROM_KNOWN_FILES_ERROR_REPLY:
          case ADD_KNOWN_FILE_WITH_FIX_ERROR_REPLY:
          case ADD_KNOWN_FILE_ERROR_REPLY:
          case EDIT_KNOWN_FILE_PATH_ERROR_REPLY:
          case UPDATE_LAST_OPENED_DATE_ERROR_REPLY:
          case SAVE_AS_TEMP_FILE_ERROR_REPLY:
          case ATTEMPT_TO_FETCH_TEMPLATES_ERROR_REPLY:
          case OFFLINE_FILE_PATH_ERROR_REPLY:
          case DEFAULT_BACKUP_LOCATION_ERROR_REPLY:
          case SET_TEMPLATE_ERROR_REPLY:
          case CUSTOM_TEMPLATES_PATH_ERROR_REPLY:
          case BACKUP_BASE_PATH_ERROR_REPLY:
          case CURRENT_TRIAL_ERROR_REPLY:
          case START_TRIAL_ERROR_REPLY:
          case EXTEND_TRIAL_WITH_RESET_ERROR_REPLY:
          case CURRENT_LICENSE_ERROR_REPLY:
          case DELETE_LICENSE_ERROR_REPLY:
          case SAVE_LICENSE_INFO_ERROR_REPLY:
          case CURRENT_KNOWN_FILES_ERROR_REPLY:
          case CURRENT_TEMPLATES_ERROR_REPLY:
          case CURRENT_CUSTOM_TEMPLATES_ERROR_REPLY:
          case CURRENT_TEMPLATE_MANIFEST_ERROR_REPLY:
          case CURRENT_EXPORT_CONFIG_SETTINGS_ERROR_REPLY:
          case SAVE_EXPORT_CONFIG_SETTINGS_ERROR_REPLY:
          case CURRENT_APP_SETTINGS_ERROR_REPLY:
          case SAVE_APP_SETTING_ERROR_REPLY:
          case CURRENT_USER_SETTINGS_ERROR_REPLY:
          case CURRENT_BACKUPS_ERROR_REPLY:
          case BACKUP_OFFLINE_BACKUP_FOR_RESUME_ERROR_REPLY:
          case READ_OFFLINE_FILES_ERROR_REPLY:
          case RM_RF_ERROR_REPLY:
          case SAVE_FILE_ERROR_REPLY:
          case SAVE_OFFLINE_FILE_ERROR_REPLY:
          case FILE_BASENAME_ERROR_REPLY:
          case READ_FILE_ERROR_REPLY:
          case BACKUP_FILE_ERROR_REPLY:
          case AUTO_SAVE_FILE_ERROR_REPLY:
          case ENSURE_BACKUP_FULL_PATH_ERROR_REPLY:
          case ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY:
          case LAST_OPENED_FILE_ERROR_REPLY:
          case SET_LAST_OPENED_FILE_ERROR_REPLY:
          case FILE_EXISTS_ERROR_REPLY: {
            rejectPromise()
            return
          }
        }

        logger.error(
          `Unknown message type reply: ${type}, with payload: ${JSON.stringify(
            payload,
            null,
            2
          )} and id: ${messageId}`
        )
        rejectPromise()
      } catch (error) {
        try {
          const { type, messageId, result } = JSON.parse(data)
          // Same as rejectPromise above, but without a lexical
          // environment with the payload.
          const unresolvedPromise = promises.get(messageId)
          if (!unresolvedPromise) {
            logger.error(
              `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
            )
            return
          }
          promises.delete(messageId)
          unresolvedPromise.reject(result)
        } catch (innerError) {
          logger.error(
            'Error while trying to reject a promise in the socket client when something went wrong responding to a message from the socket server: ',
            error.message
          )
        }
        logger.error('Error while replying: ', error.message)
      }
    })

    const ping = () => {
      return sendPromise(PING, {})
    }

    const rmRf = (path) => {
      return sendPromise(RM_RF, { path })
    }

    const saveFile = (filePath, file) => {
      return sendPromise(SAVE_FILE, { filePath, file })
    }

    const saveOfflineFile = (file) => {
      return sendPromise(SAVE_OFFLINE_FILE, { file })
    }

    const basename = (filePath) => {
      return sendPromise(FILE_BASENAME, { filePath })
    }

    const readFile = (filePath) => {
      return sendPromise(READ_FILE, { filePath })
    }

    const autoSave = (filePath, file, userId, previousFile) => {
      return sendPromise(AUTO_SAVE_FILE, { filePath, file, userId, previousFile })
    }

    const saveBackup = (filePath, file) => {
      return sendPromise(BACKUP_FILE, { filePath, file })
    }

    const ensureBackupFullPath = () => {
      return sendPromise(ENSURE_BACKUP_FULL_PATH)
    }

    const ensureBackupTodayPath = () => {
      return sendPromise(ENSURE_BACKUP_TODAY_PATH)
    }

    const fileExists = (filePath) => {
      return sendPromise(FILE_EXISTS, { filePath })
    }

    const backupOfflineBackupForResume = (file) => {
      return sendPromise(BACKUP_OFFLINE_BACKUP_FOR_RESUME, { file })
    }

    const readOfflineFiles = () => {
      return sendPromise(READ_OFFLINE_FILES)
    }

    const isTempFile = (file) => {
      return sendPromise(IS_TEMP_FILE, { file })
    }

    const setTemplate = (id, template) => {
      return sendPromise(SET_TEMPLATE, { id, template })
    }

    const setCustomTemplate = (id, template) => {
      return sendPromise(SET_CUSTOM_TEMPLATE, { id, template })
    }

    const deleteCustomTemplate = (id) => {
      return sendPromise(DELETE_CUSTOM_TEMPLATE, { id })
    }

    const defaultBackupLocation = () => {
      return sendPromise(DEFAULT_BACKUP_LOCATION)
    }

    const offlineFilePath = (filePath) => {
      return sendPromise(OFFLINE_FILE_PATH, { filePath })
    }

    const attemptToFetchTemplates = () => {
      return sendPromise(ATTEMPT_TO_FETCH_TEMPLATES)
    }

    const saveAsTempFile = (file) => {
      return sendPromise(SAVE_AS_TEMP_FILE, { file })
    }

    const deleteKnownFile = (id, filePath) => {
      return sendPromise(DELETE_KNOWN_FILE, { id, filePath })
    }

    const removeFromTempFiles = (filePath, doDelete) => {
      return sendPromise(REMOVE_FROM_TEMP_FILES, { filePath, doDelete })
    }

    const saveToTempFile = (json, name) => {
      return sendPromise(SAVE_TO_TEMP_FILE, { json, name })
    }

    const removeFromKnownFiles = (id) => {
      return sendPromise(REMOVE_FROM_KNOWN_FILES, { id })
    }

    const addKnownFile = (filePath) => {
      return sendPromise(ADD_KNOWN_FILE, { filePath })
    }

    const addKnownFileWithFix = (filePath) => {
      return sendPromise(ADD_KNOWN_FILE_WITH_FIX, { filePath })
    }

    const editKnownFilePath = (oldFilePath, newFilePath) => {
      return sendPromise(EDIT_KNOWN_FILE_PATH, { oldFilePath, newFilePath })
    }

    const updateLastOpenedDate = (id) => {
      return sendPromise(UPDATE_LAST_OPENED_DATE, { id })
    }

    const lastOpenedFile = () => {
      return sendPromise(LAST_OPENED_FILE)
    }

    const setLastOpenedFilePath = (filePath) => {
      return sendPromise(SET_LAST_OPENED_FILE, { filePath })
    }

    // ===File System APIs===

    const backupBasePath = () => {
      return sendPromise(BACKUP_BASE_PATH)
    }

    const currentTrial = () => {
      return sendPromise(CURRENT_TRIAL)
    }

    const startTrial = (numDays = null) => {
      return sendPromise(START_TRIAL, { numDays })
    }

    const extendTrialWithReset = (days) => {
      return sendPromise(EXTEND_TRIAL_WITH_RESET, { days })
    }

    const currentLicense = () => {
      return sendPromise(CURRENT_LICENSE)
    }

    const deleteLicense = () => {
      return sendPromise(DELETE_LICENSE)
    }

    const saveLicenseInfo = (newLicense) => {
      return sendPromise(SAVE_LICENSE_INFO, { newLicense })
    }

    const currentKnownFiles = () => {
      return sendPromise(CURRENT_KNOWN_FILES)
    }

    const currentTemplates = () => {
      return sendPromise(CURRENT_TEMPLATES)
    }

    const currentCustomTemplates = () => {
      return sendPromise(CURRENT_CUSTOM_TEMPLATES)
    }

    const currentTemplateManifest = () => {
      return sendPromise(CURRENT_TEMPLATE_MANIFEST)
    }

    const currentExportConfigSettings = () => {
      return sendPromise(CURRENT_EXPORT_CONFIG_SETTINGS)
    }

    const saveExportConfigSettings = (key, value) => {
      return sendPromise(SAVE_EXPORT_CONFIG_SETTINGS, { key, value })
    }

    const currentAppSettings = () => {
      return sendPromise(CURRENT_APP_SETTINGS)
    }

    const saveAppSetting = (key, value) => {
      return sendPromise(SAVE_APP_SETTING, { key, value })
    }

    const currentUserSettings = () => {
      return sendPromise(CURRENT_USER_SETTINGS)
    }

    const currentBackups = () => {
      return sendPromise(CURRENT_BACKUPS)
    }

    const customTemplatesPath = () => {
      return sendPromise(CUSTOM_TEMPLATES_PATH)
    }

    // Subscriptions
    const listenToTrialChanges = (cb) => {
      return registerCallback(LISTEN_TO_TRIAL_CHANGES, {}, cb)
    }

    const listenToLicenseChanges = (cb) => {
      return registerCallback(LISTEN_TO_LICENSE_CHANGES, {}, cb)
    }

    const listenToknownFilesChanges = (cb) => {
      return registerCallback(LISTEN_TO_KNOWN_FILES_CHANGES, {}, cb)
    }

    const listenToTemplatesChanges = (cb) => {
      return registerCallback(LISTEN_TO_TEMPLATES_CHANGES, {}, cb)
    }

    const listenToCustomTemplatesChanges = (cb) => {
      return registerCallback(LISTEN_TO_CUSTOM_TEMPLATES_CHANGES, {}, cb)
    }

    const listenToTemplateManifestChanges = (cb) => {
      return registerCallback(LISTEN_TO_TEMPLATE_MANIFEST_CHANGES, {}, cb)
    }

    const listenToExportConfigSettingsChanges = (cb) => {
      return registerCallback(LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES, {}, cb)
    }

    const listenToAppSettingsChanges = (cb) => {
      return registerCallback(LISTEN_TO_APP_SETTINGS_CHANGES, {}, cb)
    }

    const listenToUserSettingsChanges = (cb) => {
      return registerCallback(LISTEN_TO_USER_SETTINGS_CHANGES, {}, cb)
    }

    const listenToBackupsChanges = (cb) => {
      return registerCallback(LISTEN_TO_BACKUPS_CHANGES, {}, cb)
    }

    return new Promise((resolve, reject) => {
      clientConnection.on('open', () => {
        resolve({
          ping,
          rmRf,
          saveFile,
          saveOfflineFile,
          basename,
          readFile,
          autoSave,
          saveBackup,
          ensureBackupFullPath,
          ensureBackupTodayPath,
          fileExists,
          backupOfflineBackupForResume,
          readOfflineFiles,
          isTempFile,
          setTemplate,
          setCustomTemplate,
          deleteCustomTemplate,
          defaultBackupLocation,
          offlineFilePath,
          customTemplatesPath,
          attemptToFetchTemplates,
          saveAsTempFile,
          removeFromKnownFiles,
          deleteKnownFile,
          removeFromTempFiles,
          saveToTempFile,
          addKnownFile,
          addKnownFileWithFix,
          editKnownFilePath,
          updateLastOpenedDate,
          // File system APIs
          backupBasePath,
          currentTrial,
          startTrial,
          extendTrialWithReset,
          currentLicense,
          deleteLicense,
          saveLicenseInfo,
          currentKnownFiles,
          currentTemplates,
          currentCustomTemplates,
          currentTemplateManifest,
          currentExportConfigSettings,
          saveExportConfigSettings,
          currentAppSettings,
          saveAppSetting,
          currentUserSettings,
          currentBackups,
          listenToTrialChanges,
          listenToLicenseChanges,
          listenToknownFilesChanges,
          listenToTemplatesChanges,
          listenToCustomTemplatesChanges,
          listenToTemplateManifestChanges,
          listenToExportConfigSettingsChanges,
          listenToAppSettingsChanges,
          listenToUserSettingsChanges,
          listenToBackupsChanges,
          lastOpenedFile,
          setLastOpenedFilePath,
          close: clientConnection.close.bind(clientConnection),
        })
      })
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

const instance = () => {
  let initialised = false
  let client = null
  let resolvedPromise = null
  let resolve = null
  let reject = null
  let logger = null

  // See the destructured argument of the connect function for the
  // structure of `eventHandlers`.
  const createClient = (port, logger, onFailedToConnect, eventHandlers) => {
    initialised = true
    connect(port, logger, eventHandlers)
      .then((newClient) => {
        if (client) client.close(0, 'New client requested')
        client = newClient
        if (resolve) resolve(newClient)
      })
      .catch((error) => {
        if (error) {
          logger.error('Failed to connect to web socket server: ', error)
          onFailedToConnect(error)
          reject(error)
        }
      })
  }

  const whenClientIsReady = (f) => {
    if (client) {
      return new Promise((resolve, reject) => {
        defer(() => {
          const result = f(client)
          try {
            if (typeof result.then === 'function') {
              result.then(resolve, reject)
            } else {
              resolve(result)
            }
          } catch (error) {
            if (logger) {
              logger.error('Error while using client: ', error)
            }
          }
        })
      })
    }
    if (resolvedPromise) {
      return resolvedPromise.then(() => {
        return f(client)
      })
    }
    resolvedPromise = new Promise((newResolve, newReject) => {
      resolve = newResolve
      reject = newReject
    })
    return resolvedPromise.then(() => {
      return f(client)
    })
  }

  const isInitialised = () => {
    return initialised
  }

  return {
    createClient,
    whenClientIsReady,
    isInitialised,
  }
}

const { createClient, isInitialised, whenClientIsReady } = instance()

export { createClient, isInitialised, whenClientIsReady, setPort, getPort }

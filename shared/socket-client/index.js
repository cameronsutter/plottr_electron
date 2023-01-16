import { v4 as uuidv4 } from 'uuid'
import isBuffer from 'is-buffer'

import {
  PING,
  RM_RF,
  SAVE_FILE,
  SAVE_OFFLINE_FILE,
  FILE_BASENAME,
  READ_FILE,
  BACKUP_FILE,
  SAVE_BACKUP_ERROR,
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
  COPY_FILE,
  UPDATE_KNOWN_FILE_NAME,
  COPY_FILE_ERROR_REPLY,
  NUKE_LAST_OPENED_FILE_URL,
  NUKE_LAST_OPENED_FILE_URL_ERROR_REPLY,
  SHUTDOWN,
  SHUTDOWN_ERROR_REPLY,
  WRITE_FILE,
  WRITE_FILE_ERROR_REPLY,
  JOIN,
  JOIN_ERROR_REPLY,
  PATH_SEP,
  PATH_SEP_ERROR_REPLY,
  TRASH_FILE,
  TRASH_FILE_ERROR_REPLY,
  EXTNAME,
  EXTNAME_ERROR_REPLY,
  OFFLINE_FILE_URL,
  OFFLINE_FILE_URL_ERROR_REPLY,
  RESOLVE,
  RESOLVE_ERROR_REPLY,
  READDIR,
  STAT,
  READDIR_ERROR_REPLY,
  STAT_ERROR_REPLY,
  MKDIR,
  MKDIR_ERROR_REPLY,
} from '../socket-server-message-types'
import { setPort, getPort } from './workerPort'

const FORCE_IDLE_WORK_TIMEOUT = 1000
const defer =
  typeof process === 'object' && process.type === 'renderer'
    ? (f) => window.requestIdleCallback(f, { timeout: FORCE_IDLE_WORK_TIMEOUT })
    : (f) => {
        setTimeout(f, 0)
      }

const connect = (port, logger, WebSocket, { onBusy, onDone }) => {
  try {
    const clientConnection = new WebSocket(`ws://localhost:${port}`)
    const usingBrowserWebsocketClient = !clientConnection.on
    const on = (
      usingBrowserWebsocketClient ? clientConnection.addEventListener : clientConnection.on
    ).bind(clientConnection)
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

    on('message', (eventOrData) => {
      const data = usingBrowserWebsocketClient ? eventOrData.data : eventOrData
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

        // TODO: handle SAVE_BACKUP_ERRORs
        switch (type) {
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
          case COPY_FILE:
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
          case BACKUP_FILE:
          case READ_FILE:
          case FILE_BASENAME:
          case SAVE_OFFLINE_FILE:
          case SAVE_FILE:
          case RM_RF:
          case LAST_OPENED_FILE:
          case SET_LAST_OPENED_FILE:
          case NUKE_LAST_OPENED_FILE_URL:
          case SHUTDOWN:
          case WRITE_FILE:
          case JOIN:
          case PATH_SEP:
          case TRASH_FILE:
          case EXTNAME:
          case READDIR:
          case STAT:
          case MKDIR:
          case RESOLVE:
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
          case NUKE_LAST_OPENED_FILE_URL_ERROR_REPLY:
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
          case OFFLINE_FILE_URL_ERROR_REPLY:
          case DEFAULT_BACKUP_LOCATION_ERROR_REPLY:
          case SET_TEMPLATE_ERROR_REPLY:
          case CUSTOM_TEMPLATES_PATH_ERROR_REPLY:
          case COPY_FILE_ERROR_REPLY:
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
          case ENSURE_BACKUP_FULL_PATH_ERROR_REPLY:
          case ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY:
          case LAST_OPENED_FILE_ERROR_REPLY:
          case SET_LAST_OPENED_FILE_ERROR_REPLY:
          case SHUTDOWN_ERROR_REPLY:
          case WRITE_FILE_ERROR_REPLY:
          case JOIN_ERROR_REPLY:
          case PATH_SEP_ERROR_REPLY:
          case TRASH_FILE_ERROR_REPLY:
          case EXTNAME_ERROR_REPLY:
          case RESOLVE_ERROR_REPLY:
          case READDIR_ERROR_REPLY:
          case STAT_ERROR_REPLY:
          case MKDIR_ERROR_REPLY:
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

    const inBadState = () => {
      return clientConnection.readyState > 1
    }

    const ping = () => {
      return sendPromise(PING, {})
    }

    const rmRf = (path) => {
      return sendPromise(RM_RF, { path })
    }

    const saveFile = (fileURL, file) => {
      return sendPromise(SAVE_FILE, { fileURL, file })
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

    const offlineFileURL = (fileURL) => {
      return sendPromise(OFFLINE_FILE_URL, { fileURL })
    }

    const offlineFileBasePath = () => {
      return sendPromise(OFFLINE_FILE_PATH)
    }

    const attemptToFetchTemplates = () => {
      return sendPromise(ATTEMPT_TO_FETCH_TEMPLATES)
    }

    const saveAsTempFile = (file) => {
      return sendPromise(SAVE_AS_TEMP_FILE, { file })
    }

    const deleteKnownFile = (fileURL) => {
      return sendPromise(DELETE_KNOWN_FILE, { fileURL })
    }

    const updateKnownFileName = (fileURL, newName) => {
      return sendPromise(UPDATE_KNOWN_FILE_NAME, { fileURL, newName })
    }

    const removeFromTempFiles = (fileURL, doDelete) => {
      return sendPromise(REMOVE_FROM_TEMP_FILES, { fileURL, doDelete })
    }

    const saveToTempFile = (json, name) => {
      return sendPromise(SAVE_TO_TEMP_FILE, { json, name })
    }

    const removeFromKnownFiles = (fileURL) => {
      return sendPromise(REMOVE_FROM_KNOWN_FILES, { fileURL })
    }

    const addKnownFile = (fileURL) => {
      return sendPromise(ADD_KNOWN_FILE, { fileURL })
    }

    const addKnownFileWithFix = (fileURL) => {
      return sendPromise(ADD_KNOWN_FILE_WITH_FIX, { fileURL })
    }

    const editKnownFilePath = (oldFileURL, newFileURL) => {
      return sendPromise(EDIT_KNOWN_FILE_PATH, { oldFileURL, newFileURL })
    }

    const updateLastOpenedDate = (fileURL) => {
      return sendPromise(UPDATE_LAST_OPENED_DATE, { fileURL })
    }

    const lastOpenedFile = () => {
      return sendPromise(LAST_OPENED_FILE)
    }

    const setLastOpenedFilePath = (filePath) => {
      return sendPromise(SET_LAST_OPENED_FILE, { filePath })
    }

    const nukeLastOpenedFileURL = () => {
      return sendPromise(NUKE_LAST_OPENED_FILE_URL)
    }

    const shutdown = () => {
      return sendPromise(SHUTDOWN)
    }

    const writeFile = (path, file) => {
      if (isBuffer(file)) {
        const base64 = file.toString('base64')
        return sendPromise(WRITE_FILE, { path, base64 })
      }
      return sendPromise(WRITE_FILE, { path, file })
    }

    const join = (...pathArgs) => {
      return sendPromise(JOIN, { pathArgs })
    }

    const pathSep = () => {
      return sendPromise(PATH_SEP)
    }

    const trash = (fileURL) => {
      return sendPromise(TRASH_FILE, { fileURL })
    }

    const extname = (filePath) => {
      return sendPromise(EXTNAME, { filePath })
    }

    const resolvePath = (...args) => {
      return sendPromise(RESOLVE, { args })
    }

    const readdir = (path) => {
      return sendPromise(READDIR, { path })
    }

    const stat = (path) => {
      return sendPromise(STAT, { path })
    }

    const mkdir = (path) => {
      return sendPromise(MKDIR, { path })
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

    const copyFile = (sourceFileURL, newFileURL) => {
      return sendPromise(COPY_FILE, { sourceFileURL, newFileURL })
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
      on('open', () => {
        resolve({
          ping,
          rmRf,
          saveFile,
          saveOfflineFile,
          basename,
          readFile,
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
          offlineFileURL,
          offlineFileBasePath,
          customTemplatesPath,
          copyFile,
          attemptToFetchTemplates,
          saveAsTempFile,
          removeFromKnownFiles,
          deleteKnownFile,
          updateKnownFileName,
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
          nukeLastOpenedFileURL,
          shutdown,
          writeFile,
          join,
          pathSep,
          trash,
          extname,
          resolvePath,
          readdir,
          stat,
          mkdir,
          close: clientConnection.close.bind(clientConnection),
          inBadState,
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
  let connectionBroken = null

  // See the destructured argument of the connect function for the
  // structure of `eventHandlers`.
  const createClient = (
    port,
    logger,
    WebSocket,
    onFailedToConnect,
    eventHandlers,
    onConnectionBroken = () => {}
  ) => {
    initialised = true
    connectionBroken = onConnectionBroken
    return connect(port, logger, WebSocket, eventHandlers)
      .then((newClient) => {
        if (client) client.close(1000, 'New client requested')
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
        try {
          if (client.inBadState()) {
            connectionBroken()
            reject(new Error('Client connection broken'))
          } else {
            defer(() => {
              try {
                const result = f(client)
                if (typeof result.then === 'function') {
                  result.then(resolve, reject)
                } else {
                  resolve(result)
                }
              } catch (error) {
                if (logger) {
                  logger.error('Error while using client: ', error)
                }
                reject(error)
              }
            })
          }
        } catch (error) {
          reject(error)
        }
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

  const resetInitialised = () => {
    initialised = false
  }

  return {
    createClient,
    whenClientIsReady,
    isInitialised,
    resetInitialised,
  }
}

const { createClient, isInitialised, whenClientIsReady, resetInitialised } = instance()

export { createClient, isInitialised, whenClientIsReady, resetInitialised, setPort, getPort }

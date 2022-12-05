import { v4 as uuidv4 } from 'uuid'

import {
  EDIT_FILE_NAME,
  EDIT_FILE_NAME_REPLY,
  UPDATE_AUTH_FILE_NAME,
  UPDATE_AUTH_FILE_NAME_REPLY,
  LISTEN,
  LISTEN_REPLY,
  WITH_FILE_ID,
  WITH_FILE_ID_REPLY,
  TO_FIRESTORE_ARRAY,
  TO_FIRESTORE_ARRAY_REPLY,
  OVERWRITE_ALL_KEYS,
  OVERWRITE_ALL_KEYS_REPLY,
  INITIAL_FETCH,
  INITIAL_FETCH_REPLY,
  DELETE_FILE,
  DELETE_FILE_REPLY,
  STOP_LISTENING,
  STOP_LISTENING_REPLY,
  LISTEN_TO_FILES,
  LISTEN_TO_FILES_REPLY,
  FETCH_FILES,
  FETCH_FILES_REPLY,
  LOG_OUT,
  LOG_OUT_REPLY,
  MINT_COOKIE_TOKEN,
  MINT_COOKIE_TOKEN_REPLY,
  ON_SESSION_CHANGE,
  ON_SESSION_CHANGE_REPLY,
  FIREBASE_UI,
  FIREBASE_UI_REPLY,
  CURRENT_USER,
  CURRENT_USER_REPLY,
  HAS_UNDEFINED_VALUE,
  HAS_UNDEFINED_VALUE_REPLY,
  PATCH,
  PATCH_REPLY,
  OVERWRITE,
  OVERWRITE_REPLY,
  SHARE_DOCUMENT,
  SHARE_DOCUMENT_REPLY,
  PUBLISH_RCE_OPERATIONS,
  PUBLISH_RCE_OPERATIONS_REPLY,
  CATCHUP_EDITS_SEEN,
  CATCHUP_EDITS_SEEN_REPLY,
  RELEASE_RCE_LOCK,
  RELEASE_RCE_LOCK_REPLY,
  LOCK_RCE,
  LOCK_RCE_REPLY,
  LISTEN_FOR_RCE_LOCK,
  LISTEN_FOR_RCE_LOCK_REPLY,
  LISTEN_FOR_CHANGES_TO_EDITOR,
  LISTEN_FOR_CHANGES_TO_EDITOR_REPLY,
  DELETE_CHANGE_SIGNAL,
  DELETE_CHANGE_SIGNAL_REPLY,
  DELETE_OLD_CHANGES,
  DELETE_OLD_CHANGES_REPLY,
  FETCH_RCE_OPERATIONS,
  FETCH_RCE_OPERATIONS_REPLY,
  SAVE_BACKUP,
  SAVE_BACKUP_REPLY,
  LISTEN_FOR_BACKUPS,
  LISTEN_FOR_BACKUPS_REPLY,
  SAVE_CUSTOM_TEMPLATE,
  SAVE_CUSTOM_TEMPLATE_REPLY,
  ALL_TEMPLATE_URLS_FOR_USER,
  ALL_TEMPLATE_URLS_FOR_USER_REPLY,
  LISTEN_TO_CUSTOM_TEMPLATES,
  LISTEN_TO_CUSTOM_TEMPLATES_REPLY,
  EDIT_CUSTOM_TEMPLATE,
  EDIT_CUSTOM_TEMPLATE_REPLY,
  DELETE_CUSTOM_TEMPLATE,
  DELETE_CUSTOM_TEMPLATE_REPLY,
  SAVE_IMAGE_TO_STORAGE_BLOB,
  SAVE_IMAGE_TO_STORAGE_BLOB_REPLY,
  SAVE_IMAGE_TO_STORAGE_FROM_URL,
  SAVE_IMAGE_TO_STORAGE_FROM_URL_REPLY,
  BACKUP_PUBLIC_URL,
  BACKUP_PUBLIC_URL_REPLY,
  IMAGE_PUBLIC_URL,
  IMAGE_PUBLIC_URL_REPLY,
  IS_STORAGE_URL,
  IS_STORAGE_URL_REPLY,
  LOGIN_WITH_EMAIL_AND_PASSWORD,
  LOGIN_WITH_EMAIL_AND_PASSWORD_REPLY,
  GET_ID_TOKEN_RESULT,
  GET_ID_TOKEN_RESULT_REPLY,
  INITIALISE_WORKER,
  LISTEN_UNSUBSCRIBE,
  LOG_FROM_WORKER,
  EDIT_FILE_NAME_ERROR_REPLY,
  OVERWRITE_ALL_KEYS_ERROR_REPLY,
  INITIAL_FETCH_ERROR_REPLY,
  DELETE_FILE_ERROR_REPLY,
  FETCH_FILES_ERROR_REPLY,
  LOG_OUT_ERROR_REPLY,
  MINT_COOKIE_TOKEN_ERROR_REPLY,
  PATCH_ERROR_REPLY,
  OVERWRITE_ERROR_REPLY,
  SHARE_DOCUMENT_ERROR_REPLY,
  RELEASE_RCE_LOCK_ERROR_REPLY,
  LOCK_RCE_ERROR_REPLY,
  SAVE_BACKUP_ERROR_REPLY,
  SAVE_CUSTOM_TEMPLATE_ERROR_REPLY,
  EDIT_CUSTOM_TEMPLATE_ERROR_REPLY,
  DELETE_CUSTOM_TEMPLATE_ERROR_REPLY,
  SAVE_IMAGE_TO_STORAGE_BLOB_ERROR_REPLY,
  SAVE_IMAGE_TO_STORAGE_FROM_URL_ERROR_REPLY,
  BACKUP_PUBLIC_URL_ERROR_REPLY,
  IMAGE_PUBLIC_URL_ERROR_REPLY,
  GET_ID_TOKEN_RESULT_ERROR_REPLY,
  LOGIN_WITH_EMAIL_AND_PASSWORD_ERROR_REPLY,
} from './firebase-messages'

export const firebaseWorker = (logger, mintSessionClientId) => {
  let initialised = false
  let store = null

  const worker = new Worker(new URL('./_firebase-worker.js', import.meta.url))
  const promises = new Map()
  const callbacks = new Map()

  const sendPromise = (type, payload) => {
    const messageId = uuidv4()
    const reply = new Promise((resolve, reject) => {
      try {
        worker.postMessage({
          type,
          messageId,
          payload,
        })
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
        worker.postMessage({
          type: typeToUnsubscribeType(type),
          messageId,
          payload: {},
        })
      } catch (error) {
        logger.error(`Error trying to unsubscribe from ${type} with payload: ${payload}`)
      }
    }
    try {
      worker.postMessage({
        type,
        messageId,
        payload,
      })
      return unsubscribe
    } catch (error) {
      logger.error(`Error while registering a listener on ${type} with payload: ${payload}`)
      throw error
    }
  }

  const setStore = (targetStore) => {
    store = targetStore
  }

  const editFileName = (fileId, newName) => {
    return sendPromise(EDIT_FILE_NAME, { fileId, newName })
  }

  const updateAuthFileName = (fileId, newName) => {
    return sendPromise(UPDATE_AUTH_FILE_NAME, { fileId, newName })
  }

  // Includes the store to maintain backwards compatibility with
  // previous versions.
  const listen = (targetStore, userId, fileId, clientId, fileVersion) => {
    if (targetStore) store = targetStore
    const messageId = uuidv4()
    const unsubscribeFunction = () => {
      try {
        worker.postMessage({
          type: LISTEN_UNSUBSCRIBE,
          payload: messageId,
          messageId: messageId,
        })
      } catch (error) {
        logger.error('Error while trying to unsubscribe from listen with: ', {
          userId,
          fileId,
          clientId,
          fileVersion,
        })
      }
    }
    try {
      worker.postMessage({
        type: LISTEN,
        messageId,
        payload: {
          userId,
          fileId,
          clientId,
          fileVersion,
        },
      })
    } catch (error) {
      logger.error('Error trying to listen to file', { userId, fileId, clientId, fileVersion })
      throw error
    }
    return unsubscribeFunction
  }
  const overwriteAllKeys = (fileId, clientId, state) => {
    return sendPromise(OVERWRITE_ALL_KEYS, { fileId, clientId, state })
  }
  const initialFetch = (userId, fileId, clientId, version) => {
    return sendPromise(INITIAL_FETCH, { userId, fileId, clientId, version })
  }
  const deleteFile = (fileId, userId, clientId) => {
    return sendPromise(DELETE_FILE, { fileId, userId, clientId })
  }
  const listenToFiles = (userId, callback) => {
    return registerCallback(LISTEN_TO_FILES, { userId }, callback)
  }
  const fetchFiles = (userId) => {
    return sendPromise(FETCH_FILES, { userId })
  }
  const logOut = () => {
    return sendPromise(LOG_OUT, {})
  }
  const mintCookieToken = (user) => {
    return sendPromise(MINT_COOKIE_TOKEN, { user })
  }
  const onSessionChange = (cb) => {
    return registerCallback(ON_SESSION_CHANGE, {}, cb)
  }
  const currentUser = () => {
    return sendPromise(CURRENT_USER, {})
  }
  const patch = (path, fileId, payload, clientId) => {
    return sendPromise(PATCH, { path, fileId, payload, clientId })
  }
  const overwrite = (path, fileId, payload, clientId) => {
    return sendPromise(OVERWRITE, { path, fileId, payload, clientId })
  }
  const shareDocument = (userId, fileId, emailAddress, permission) => {
    return sendPromise(SHARE_DOCUMENT, { userId, fileId, emailAddress, permission })
  }
  const releaseRCELock = (fileId, editorId, expectedLock) => {
    return sendPromise(RELEASE_RCE_LOCK, { fileId, editorId, expectedLock })
  }
  const lockRCE = (fileId, editorId, clientId, expectedLock, emailAddress = '') => {
    return sendPromise(LOCK_RCE, { fileId, editorId, clientId, expectedLock, emailAddress })
  }
  const listenForRCELock = (fileId, editorId, clientId, cb) => {
    return registerCallback(LISTEN_FOR_RCE_LOCK, { fileId, editorId, clientId }, cb)
  }
  const saveBackup = (userId, file) => {
    return sendPromise(SAVE_BACKUP, { userId, file })
  }
  const listenForBackups = (userId, onBackupsChanged) => {
    return registerCallback(LISTEN_FOR_BACKUPS, { userId }, onBackupsChanged)
  }
  const saveCustomTemplate = (userId, template) => {
    return sendPromise(SAVE_CUSTOM_TEMPLATE, { userId, template })
  }
  const listenToCustomTemplates = (userId, callback) => {
    return registerCallback(LISTEN_TO_CUSTOM_TEMPLATES, { userId }, callback)
  }
  const editCustomTemplate = (userId, templateId) => {
    return sendPromise(EDIT_CUSTOM_TEMPLATE, { userId, templateId })
  }
  const deleteCustomTemplate = (userId, templateId) => {
    return sendPromise(DELETE_CUSTOM_TEMPLATE, { userId, templateId })
  }
  const saveImageToStorageBlob = (userId, imageName, imageBlob) => {
    return sendPromise(SAVE_IMAGE_TO_STORAGE_BLOB, { userId, imageName, imageBlob })
  }
  const saveImageToStorageFromURL = (userId, imageName, imageUrl) => {
    return sendPromise(SAVE_IMAGE_TO_STORAGE_FROM_URL, { userId, imageName, imageUrl })
  }
  const backupPublicURL = (storageProtocolURL) => {
    return sendPromise(BACKUP_PUBLIC_URL, { storageProtocolURL })
  }
  const imagePublicURL = (storageProtocolURL, fileId, userId) => {
    return sendPromise(IMAGE_PUBLIC_URL, { storageProtocolURL, fileId, userId })
  }
  const isStorageURL = (string) => {
    return sendPromise(IS_STORAGE_URL, { string })
  }
  const loginWithEmailAndPassword = (userName, password) => {
    return sendPromise(LOGIN_WITH_EMAIL_AND_PASSWORD, { userName, password })
  }
  const getIdTokenResult = () => {
    return sendPromise(GET_ID_TOKEN_RESULT, {})
  }

  worker.onmessage = (event) => {
    const { type, payload, messageId } = event.data
    const resolvePromise = () => {
      const unresolvedPromise = promises.get(messageId)
      if (!unresolvedPromise) {
        logger.error(
          `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
        )
        return
      }
      promises.delete(messageId)
      unresolvedPromise.resolve(payload)
    }
    const resolvePromiseWithError = () => {
      const unresolvedPromise = promises.get(messageId)
      if (!unresolvedPromise) {
        logger.error(
          `Received a reply for ${messageId} that ${type} completed, but there was no promise to fulfil`
        )
        return
      }
      promises.delete(messageId)
      unresolvedPromise.reject(payload)
    }
    switch (type) {
      case LISTEN_TO_CUSTOM_TEMPLATES_REPLY:
      case LISTEN_FOR_BACKUPS_REPLY:
      case LISTEN_FOR_RCE_LOCK_REPLY:
      case ON_SESSION_CHANGE_REPLY:
      case LISTEN_TO_FILES_REPLY: {
        const callback = callbacks.get(messageId)
        // We might get a late reply from the worker thread.  i.e. it
        // could reply after we unsubscribed on this side.  In that
        // case, there'll be no callback registered.
        if (callback) callback(payload)
        return
      }
      case LISTEN_REPLY: {
        const { action } = payload
        if (!store) {
          logger.error('Store not set before reply heard from RCE worker!')
          throw new Error('Reply heard from RCE worker listener before store was set.')
        }
        store.dispatch(action)
        return
      }
      case IS_STORAGE_URL_REPLY:
      case GET_ID_TOKEN_RESULT_REPLY:
      case IMAGE_PUBLIC_URL_REPLY:
      case BACKUP_PUBLIC_URL_REPLY:
      case SAVE_IMAGE_TO_STORAGE_FROM_URL_REPLY:
      case SAVE_IMAGE_TO_STORAGE_BLOB_REPLY:
      case DELETE_CUSTOM_TEMPLATE_REPLY:
      case EDIT_CUSTOM_TEMPLATE_REPLY:
      case SAVE_CUSTOM_TEMPLATE_REPLY:
      case SAVE_BACKUP_REPLY:
      case LOCK_RCE_REPLY:
      case RELEASE_RCE_LOCK_REPLY:
      case SHARE_DOCUMENT_REPLY:
      case OVERWRITE_REPLY:
      case PATCH_REPLY:
      case CURRENT_USER_REPLY:
      case MINT_COOKIE_TOKEN_REPLY:
      case LOG_OUT_REPLY:
      case FETCH_FILES_REPLY:
      case INITIAL_FETCH_REPLY:
      case DELETE_FILE_REPLY:
      case EDIT_FILE_NAME_REPLY:
      case UPDATE_AUTH_FILE_NAME_REPLY:
      case OVERWRITE_ALL_KEYS_REPLY: {
        resolvePromise()
        return
      }
      case LOG_FROM_WORKER: {
        switch (payload.level) {
          case 'info': {
            logger.info(...payload.args)
            break
          }
          case 'warn': {
            logger.warn(...payload.args)
            break
          }
          case 'error': {
            logger.error(...payload.args)
            break
          }
          default: {
            logger.info(...payload.args)
            break
          }
        }
        break
      }
      // Caught errors in promises
      case EDIT_FILE_NAME_ERROR_REPLY:
      case OVERWRITE_ALL_KEYS_ERROR_REPLY:
      case INITIAL_FETCH_ERROR_REPLY:
      case DELETE_FILE_ERROR_REPLY:
      case FETCH_FILES_ERROR_REPLY:
      case LOG_OUT_ERROR_REPLY:
      case MINT_COOKIE_TOKEN_ERROR_REPLY:
      case PATCH_ERROR_REPLY:
      case OVERWRITE_ERROR_REPLY:
      case SHARE_DOCUMENT_ERROR_REPLY:
      case RELEASE_RCE_LOCK_ERROR_REPLY:
      case LOCK_RCE_ERROR_REPLY:
      case SAVE_BACKUP_ERROR_REPLY:
      case SAVE_CUSTOM_TEMPLATE_ERROR_REPLY:
      case EDIT_CUSTOM_TEMPLATE_ERROR_REPLY:
      case DELETE_CUSTOM_TEMPLATE_ERROR_REPLY:
      case SAVE_IMAGE_TO_STORAGE_BLOB_ERROR_REPLY:
      case SAVE_IMAGE_TO_STORAGE_FROM_URL_ERROR_REPLY:
      case BACKUP_PUBLIC_URL_ERROR_REPLY:
      case IMAGE_PUBLIC_URL_ERROR_REPLY:
      case GET_ID_TOKEN_RESULT_ERROR_REPLY:
      case LOGIN_WITH_EMAIL_AND_PASSWORD_ERROR_REPLY: {
        resolvePromiseWithError()
        return
      }
    }
  }
  mintSessionClientId()
    .then((clientId) => {
      worker.postMessage({
        type: INITIALISE_WORKER,
        messageId: uuidv4(),
        payload: { clientId },
      })
    })
    .catch((error) => {
      logger.error('Error initialising worker: ', error)
      throw error
    })

  return {
    setStore,
    editFileName,
    updateAuthFileName,
    listen,
    overwriteAllKeys,
    initialFetch,
    deleteFile,
    listenToFiles,
    fetchFiles,
    logOut,
    mintCookieToken,
    onSessionChange,
    currentUser,
    patch,
    overwrite,
    shareDocument,
    releaseRCELock,
    lockRCE,
    listenForRCELock,
    saveBackup,
    listenForBackups,
    saveCustomTemplate,
    listenToCustomTemplates,
    editCustomTemplate,
    deleteCustomTemplate,
    saveImageToStorageBlob,
    saveImageToStorageFromURL,
    backupPublicURL,
    imagePublicURL,
    isStorageURL,
    loginWithEmailAndPassword,
    getIdTokenResult,
    isInitialised: () => initialised,
  }
}

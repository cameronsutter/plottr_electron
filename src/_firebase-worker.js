import { wireUpAPI } from 'plottr_firebase'

import {
  EDIT_FILE_NAME,
  LISTEN,
  WITH_FILE_ID,
  TO_FIRESTORE_ARRAY,
  OVERWRITE_ALL_KEYS,
  INITIAL_FETCH,
  DELETE_FILE,
  STOP_LISTENING,
  LISTEN_TO_FILES,
  FETCH_FILES,
  LOG_OUT,
  MINT_COOKIE_TOKEN,
  ON_SESSION_CHANGE,
  FIREBASE_UI,
  CURRENT_USER,
  HAS_UNDEFINED_VALUE,
  PATCH,
  OVERWRITE,
  SHARE_DOCUMENT,
  PUBLISH_RCE_OPERATIONS,
  CATCHUP_EDITS_SEEN,
  RELEASE_RCE_LOCK,
  LOCK_RCE,
  LISTEN_FOR_RCE_LOCK,
  LISTEN_FOR_CHANGES_TO_EDITOR,
  DELETE_CHANGE_SIGNAL,
  DELETE_OLD_CHANGES,
  FETCH_RCE_OPERATIONS,
  SAVE_BACKUP,
  LISTEN_FOR_BACKUPS,
  SAVE_CUSTOM_TEMPLATE,
  ALL_TEMPLATE_URLS_FOR_USER,
  LISTEN_TO_CUSTOM_TEMPLATES,
  EDIT_CUSTOM_TEMPLATE,
  DELETE_CUSTOM_TEMPLATE,
  SAVE_IMAGE_TO_STORAGE_BLOB,
  SAVE_IMAGE_TO_STORAGE_FROM_URL,
  BACKUP_PUBLIC_URL,
  IMAGE_PUBLIC_URL,
  IS_STORAGE_URL,
  LOGIN_WITH_EMAIL_AND_PASSWORD,
  GET_ID_TOKEN_RESULT,
  INITIALISE_WORKER,
  ON_SESSION_CHANGE_UNSUBSCRIBE,
  LISTEN_TO_FILES_UNSUBSCRIBE,
  LISTEN_UNSUBSCRIBE,
  LISTEN_FOR_RCE_LOCK_UNSUBSCRIBE,
} from './firebase-messages'
import { logger } from './worker-logger'

const wiredUp = wireUpAPI(logger)

const editFileName = wiredUp.editFileName
const listenToFile = wiredUp.listenToFile
const listenToBeats = wiredUp.listenToBeats
const listenToCards = wiredUp.listenToCards
const listenToSeries = wiredUp.listenToSeries
const listenToBooks = wiredUp.listenToBooks
const listenToCategories = wiredUp.listenToCategories
const listenToCharacters = wiredUp.listenToCharacters
const listenToCustomAttributes = wiredUp.listenToCustomAttributes
const listenToFeatureFlags = wiredUp.listenToFeatureFlags
const listenToLines = wiredUp.listenToLines
const listenToNotes = wiredUp.listenToNotes
const listenToPlaces = wiredUp.listenToPlaces
const listenToTags = wiredUp.listenToTags
const listenToHierarchyLevels = wiredUp.listenToHierarchyLevels
const listenToImages = wiredUp.listenToImages
const overwriteAllKeys = wiredUp.overwriteAllKeys
const initialFetch = wiredUp.initialFetch
const deleteFile = wiredUp.deleteFile
const listenToFiles = wiredUp.listenToFiles
const fetchFiles = wiredUp.fetchFiles
const logOut = wiredUp.logOut
const mintCookieToken = wiredUp.mintCookieToken
const onSessionChange = wiredUp.onSessionChange
const currentUser = wiredUp.currentUser
const patch = wiredUp.patch
const overwrite = wiredUp.overwrite
const shareDocument = wiredUp.shareDocument
const releaseRCELock = wiredUp.releaseRCELock
const lockRCE = wiredUp.lockRCE
const listenForRCELock = wiredUp.listenForRCELock
const saveBackup = wiredUp.saveBackup
const listenForBackups = wiredUp.listenForBackups
const saveCustomTemplate = wiredUp.saveCustomTemplate
const listenToCustomTemplates = wiredUp.listenToCustomTemplates
const editCustomTemplate = wiredUp.editCustomTemplate
const deleteCustomTemplate = wiredUp.deleteCustomTemplate
const saveImageToStorageBlob = wiredUp.saveImageToStorageBlob
const saveImageToStorageFromURL = wiredUp.saveImageToStorageFromURL
const backupPublicURL = wiredUp.backupPublicURL
const imagePublicURL = wiredUp.imagePublicURL
const isStorageURL = wiredUp.isStorageURL
const loginWithEmailAndPassword = wiredUp.loginWithEmailAndPassword

const typeToReplyType = (type) => `${type}_REPLY`
const errorTypeToReplyType = (type) => `${type}_ERROR_REPLY`

const unsubscribeFunctions = new Map()

self.onmessage = (event) => {
  const { type, messageId } = event.data
  const messagePayload = event.data.payload

  const replyToPromise =
    (type, withResult = (x) => x) =>
    (result) => {
      try {
        self.postMessage({
          type: typeToReplyType(type),
          payload: withResult(result),
          messageId,
        })
      } catch (error) {
        logger.error('Error posting message back', error)
        try {
          self.postMessage({
            type: errorTypeToReplyType(type),
            payload: {
              message: error.message,
              source: 'reply',
            },
            messageId,
          })
        } catch (secondError) {
          logger.error(
            'Error telling the main process about an error.  Second error: ',
            secondError,
            '.  First error (the error we tried to tell the main process): ',
            error
          )
        }
      }
    }

  switch (type) {
    case INITIALISE_WORKER: {
      const { clientId } = messagePayload
      self.clientId = clientId
      self.postMessage({
        type: typeToReplyType(INITIALISE_WORKER),
        messageId,
        payload: {},
      })
      return
    }
    case EDIT_FILE_NAME: {
      const { userId, fileId, newName } = messagePayload
      editFileName(userId, fileId, newName).then(replyToPromise(type))
      return
    }
    case LISTEN: {
      const { userId, fileId, clientId, fileVersion } = messagePayload
      const replyWithReduxAction = (action) => {
        self.postMessage({
          type: typeToReplyType(type),
          messageId,
          payload: {
            action,
          },
        })
      }
      const unsubscribeToFile = listenToFile(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToBeats = listenToBeats(
        userId,
        fileId,
        clientId,
        fileVersion,
        replyWithReduxAction
      )
      const unsubscribeToCards = listenToCards(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToSeries = listenToSeries(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToBooks = listenToBooks(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToCategories = listenToCategories(
        userId,
        fileId,
        clientId,
        replyWithReduxAction
      )
      const unsubscribeToCharacters = listenToCharacters(
        userId,
        fileId,
        clientId,
        replyWithReduxAction
      )
      const unsubscribeToAttributes = listenToCustomAttributes(
        userId,
        fileId,
        clientId,
        replyWithReduxAction
      )
      const unsubscribeToFlags = listenToFeatureFlags(
        userId,
        fileId,
        clientId,
        replyWithReduxAction
      )
      const unsubscribeToLines = listenToLines(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToNotes = listenToNotes(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToPlaces = listenToPlaces(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToTags = listenToTags(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribeToLevels = listenToHierarchyLevels(
        userId,
        fileId,
        clientId,
        replyWithReduxAction
      )
      const unsubscribeToImages = listenToImages(userId, fileId, clientId, replyWithReduxAction)
      const unsubscribe = () => {
        unsubscribeToFile()
        unsubscribeToBeats()
        unsubscribeToCards()
        unsubscribeToSeries()
        unsubscribeToBooks()
        unsubscribeToCategories()
        unsubscribeToCharacters()
        unsubscribeToAttributes()
        unsubscribeToFlags()
        unsubscribeToLines()
        unsubscribeToNotes()
        unsubscribeToPlaces()
        unsubscribeToTags()
        unsubscribeToLevels()
        unsubscribeToImages()
      }
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case LISTEN_FOR_RCE_LOCK_UNSUBSCRIBE:
    case ON_SESSION_CHANGE_UNSUBSCRIBE:
    case LISTEN_TO_FILES_UNSUBSCRIBE:
    case LISTEN_UNSUBSCRIBE: {
      const unsubscribe = unsubscribeFunctions.get(messageId)
      if (!unsubscribe) {
        console.error(
          `Tried to unsubscribe from ${type} with a message id of ${messageId} but it's either already been done or never existed.`
        )
        return
      }
      unsubscribe()
      unsubscribeFunctions.delete(messageId)
      return
    }
    case OVERWRITE_ALL_KEYS: {
      const { fileId, clientId, state } = messagePayload
      overwriteAllKeys(fileId, clientId, state).then(replyToPromise(OVERWRITE_ALL_KEYS))
      return
    }
    case INITIAL_FETCH: {
      const { userId, fileId, clientId, version } = messagePayload
      initialFetch(userId, fileId, clientId, version).then(replyToPromise(INITIAL_FETCH))
      return
    }
    case DELETE_FILE: {
      const { fileId, userId, clientId } = messagePayload
      deleteFile(fileId, userId, clientId).then(replyToPromise(DELETE_FILE))
      return
    }
    case LISTEN_TO_FILES: {
      const { userId } = messagePayload
      const unsubscribe = listenToFiles(userId, (result) => {
        self.postMessage({
          type: typeToReplyType(LISTEN_TO_FILES),
          messageId,
          payload: result,
        })
      })
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case FETCH_FILES: {
      const { userId } = messagePayload
      fetchFiles(userId).then(replyToPromise(FETCH_FILES))
      return
    }
    case LOG_OUT: {
      logOut().then(replyToPromise(LOG_OUT))
      return
    }
    case MINT_COOKIE_TOKEN: {
      // NOTE: not sure that user can be serialised!!!
      const { user } = messagePayload
      mintCookieToken(user).then(replyToPromise(MINT_COOKIE_TOKEN))
      return
    }
    case ON_SESSION_CHANGE: {
      // TODO: I'm not sure that the user can be serialised.
      const unsubscribe = onSessionChange((user) => {
        self.postMessage({
          type: typeToReplyType(ON_SESSION_CHANGE),
          messageId,
          payload: user && {
            email: user.email,
            uid: user.uid,
          },
        })
      })
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case CURRENT_USER: {
      const user = currentUser()
      self.postMessage({
        type: typeToReplyType(CURRENT_USER),
        messageId,
        payload: user && {
          email: user.email,
          uid: user.uid,
        },
      })
      return
    }
    case PATCH: {
      const { path, fileId, payload, clientId } = messagePayload
      patch(path, fileId, payload, clientId).then(replyToPromise(PATCH))
      return
    }
    case OVERWRITE: {
      const { path, fileId, payload, clientId } = messagePayload
      overwrite(path, fileId, payload, clientId).then(replyToPromise(OVERWRITE))
      return
    }
    case SHARE_DOCUMENT: {
      const { userId, fileId, emailAddress, permission } = messagePayload
      shareDocument(userId, fileId, emailAddress, permission).then(replyToPromise(SHARE_DOCUMENT))
      return
    }
    case RELEASE_RCE_LOCK: {
      const { fileId, editorId, expectedLock } = messagePayload
      releaseRCELock(fileId, editorId, expectedLock).then(
        replyToPromise(RELEASE_RCE_LOCK, (_lock) => null)
      )
      return
    }
    case LOCK_RCE: {
      const { fileId, editorId, clientId, expectedLock, emailAddress } = messagePayload
      lockRCE(fileId, editorId, clientId, expectedLock, emailAddress).then(replyToPromise(LOCK_RCE))
      return
    }
    case SAVE_BACKUP: {
      const { userId, file } = messagePayload
      saveBackup(userId, file).then(replyToPromise(SAVE_BACKUP))
      return
    }
    case SAVE_CUSTOM_TEMPLATE: {
      const { userId, template } = messagePayload
      saveCustomTemplate(userId, template).then(replyToPromise(SAVE_CUSTOM_TEMPLATE))
      return
    }
    case EDIT_CUSTOM_TEMPLATE: {
      const { userId, templateId } = messagePayload
      editCustomTemplate(userId, templateId).then(replyToPromise(EDIT_CUSTOM_TEMPLATE))
      return
    }
    case DELETE_CUSTOM_TEMPLATE: {
      const { userId, templateId } = messagePayload
      deleteCustomTemplate(userId, templateId).then(replyToPromise(DELETE_CUSTOM_TEMPLATE))
      return
    }
    case SAVE_IMAGE_TO_STORAGE_BLOB: {
      const { userId, imageName, imageBlob } = messagePayload
      saveImageToStorageBlob(userId, imageName, imageBlob).then(
        replyToPromise(SAVE_IMAGE_TO_STORAGE_BLOB)
      )
      return
    }
    case SAVE_IMAGE_TO_STORAGE_FROM_URL: {
      const { userId, imageName, imageUrl } = messagePayload
      saveImageToStorageFromURL(userId, imageName, imageUrl).then(
        replyToPromise(SAVE_IMAGE_TO_STORAGE_FROM_URL)
      )
      return
    }
    case BACKUP_PUBLIC_URL: {
      const { storageProtocolURL } = messagePayload
      backupPublicURL(storageProtocolURL).then(replyToPromise(BACKUP_PUBLIC_URL))
      return
    }
    case IMAGE_PUBLIC_URL: {
      const { storageProtocolURL, fileId, userId } = messagePayload
      imagePublicURL(storageProtocolURL, fileId, userId).then(replyToPromise(IMAGE_PUBLIC_URL))
      return
    }
    case GET_ID_TOKEN_RESULT: {
      const user = currentUser()
      if (user) {
        user.getIdTokenResult().then(
          replyToPromise(GET_ID_TOKEN_RESULT, (result) => ({
            claims: {
              ...result.claims,
            },
          }))
        )
      } else {
        self.postMessage({
          type: typeToReplyType(GET_ID_TOKEN_RESULT),
          messageId,
          // Shape exists because of how it was historically used by
          // the app before being refactored to this location.
          payload: {
            claims: {},
          },
        })
      }
      return
    }
    case IS_STORAGE_URL: {
      const { string } = messagePayload
      self.postMessage({
        type: typeToReplyType(IS_STORAGE_URL),
        messageId,
        payload: isStorageURL(string),
      })
      return
    }
    case LISTEN_FOR_RCE_LOCK: {
      const { fileId, editorId, clientId } = messagePayload
      const unsubscribe = listenForRCELock(fileId, editorId, clientId, (result) => {
        self.postMessage({
          type: typeToReplyType(LISTEN_FOR_RCE_LOCK),
          messageId,
          payload: result,
        })
      })
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case LISTEN_FOR_BACKUPS: {
      const { userId } = messagePayload
      const unsubscribe = listenForBackups(userId, (result) => {
        self.postMessage({
          type: typeToReplyType(LISTEN_FOR_BACKUPS),
          messageId,
          payload: result,
        })
      })
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case LISTEN_TO_CUSTOM_TEMPLATES: {
      const { userId } = messagePayload
      const unsubscribe = listenToCustomTemplates(userId, (result) => {
        self.postMessage({
          type: typeToReplyType(LISTEN_TO_CUSTOM_TEMPLATES),
          messageId,
          payload: result,
        })
      })
      unsubscribeFunctions.set(messageId, unsubscribe)
      return
    }
    case LOGIN_WITH_EMAIL_AND_PASSWORD: {
      const { userName, password } = messagePayload
      loginWithEmailAndPassword(userName, password).then(
        replyToPromise(
          LOGIN_WITH_EMAIL_AND_PASSWORD,
          (user) =>
            user && {
              email: user.email,
              uid: user.uid,
            }
        )
      )
      return
    }
    default: {
      logger.warn(`Unhandled firebase worker message: ${type}, with payload: ${messagePayload}`)
    }
  }
}

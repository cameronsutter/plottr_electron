import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import Config from 'react-native-config'

import api from '../src/api'

const { BASE_API_DOMAIN } = Config

database().settings({ ignoreUndefinedProperties: true }, { merge: true })

export const signInWithEmailAndPassword = (userName, password) => {
  return auth().signInWithEmailAndPassword(userName, password)
}

const wiredUp = api(
  auth,
  database,
  storage,
  BASE_API_DOMAIN,
  process.env.NEXT_PUBLIC_NODE_ENV === 'development'
)

export const editFileName = wiredUp.editFileName
export const listen = wiredUp.listen
export const withFileId = wiredUp.withFileId
export const toFirestoreArray = wiredUp.toFirestoreArray
export const overwriteAllKeys = wiredUp.overwriteAllKeys
export const initialFetch = wiredUp.initialFetch
export const deleteFile = wiredUp.deleteFile
export const stopListening = wiredUp.stopListening
export const listenToFiles = wiredUp.listenToFiles
export const fetchFiles = wiredUp.fetchFiles
export const logOut = wiredUp.logOut
export const mintCookieToken = wiredUp.mintCookieToken
export const onSessionChange = wiredUp.onSessionChange
export const firebaseUI = wiredUp.firebaseUI
export const currentUser = wiredUp.currentUser
export const hasUndefinedValue = wiredUp.hasUndefinedValue
export const patch = wiredUp.patch
export const overwrite = wiredUp.overwrite
export const shareDocument = wiredUp.shareDocument
export const publishRCEOperations = wiredUp.publishRCEOperations
export const catchupEditsSeen = wiredUp.catchupEditsSeen
export const releaseRCELock = wiredUp.releaseRCELock
export const lockRCE = wiredUp.lockRCE
export const listenForRCELock = wiredUp.listenForRCELock
export const listenForChangesToEditor = wiredUp.listenForChangesToEditor
export const deleteChangeSignal = wiredUp.deleteChangeSignal
export const deleteOldChanges = wiredUp.deleteOldChanges
export const fetchRCEOperations = wiredUp.fetchRCEOperations
export const saveBackup = wiredUp.saveBackup
export const listenForBackups = wiredUp.listenForBackups
export const saveCustomTemplate = wiredUp.saveCustomTemplate
export const allTemplateUrlsForUser = wiredUp.allTemplateUrlsForUser
export const listenToCustomTemplates = wiredUp.listenToCustomTemplates
export const editCustomTemplate = wiredUp.editCustomTemplate
export const deleteCustomTemplate = wiredUp.deleteCustomTemplate
export const saveImageToStorageBlob = wiredUp.saveImageToStorageBlob
export const saveImageToStorageFromURL = wiredUp.saveImageToStorageFromURL
export const backupPublicURL = wiredUp.backupPublicURL
export const imagePublicURL = wiredUp.imagePublicURL
export const isStorageURL = wiredUp.isStorageURL

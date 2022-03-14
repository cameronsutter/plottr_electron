import { firebaseWorker } from './firebase-worker'

import { logger } from './logger'

const worker = firebaseWorker(logger)

export const editFileName = worker.editFileName
export const listen = worker.listen
export const overwriteAllKeys = worker.overwriteAllKeys
export const initialFetch = worker.initialFetch
export const deleteFile = worker.deleteFile
export const listenToFiles = worker.listenToFiles
export const fetchFiles = worker.fetchFiles
export const logOut = worker.logOut
export const mintCookieToken = worker.mintCookieToken
export const onSessionChange = worker.onSessionChange
export const currentUser = worker.currentUser
export const patch = worker.patch
export const overwrite = worker.overwrite
export const shareDocument = worker.shareDocument
export const releaseRCELock = worker.releaseRCELock
export const lockRCE = worker.lockRCE
export const listenForRCELock = worker.listenForRCELock
export const saveBackup = worker.saveBackup
export const listenForBackups = worker.listenForBackups
export const saveCustomTemplate = worker.saveCustomTemplate
export const listenToCustomTemplates = worker.listenToCustomTemplates
export const editCustomTemplate = worker.editCustomTemplate
export const deleteCustomTemplate = worker.deleteCustomTemplate
export const saveImageToStorageBlob = worker.saveImageToStorageBlob
export const saveImageToStorageFromURL = worker.saveImageToStorageFromURL
export const backupPublicURL = worker.backupPublicURL
export const imagePublicURL = worker.imagePublicURL
export const isStorageURL = worker.isStorageURL
export const loginWithEmailAndPassword = worker.loginWithEmailAndPassword
export const getIdTokenResult = worker.getIdTokenResult
export const isInitialised = worker.isInitialised

// Duplicated utility functions
export const toFirestoreArray = (array) =>
  array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

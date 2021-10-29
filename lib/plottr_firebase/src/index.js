import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import api from './api'

const baseURL = () => {
  return process.env.API_BASE_DOMAIN ? `https://${process.env.API_BASE_DOMAIN}` : ''
}

const firebaseConfig =
  process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production'
    ? {
        apiKey: process.env.FIREBASE_KEY || process.env.NEXT_PUBLIC_FIREBASE_KEY,
        authDomain: 'plottr.firebaseapp.com',
        databaseURL: 'https://plottr.firebaseio.com',
        projectId: 'plottr',
        storageBucket: 'plottr.appspot.com',
        messagingSenderId: '414647050330',
        appId: '1:414647050330:web:6d0520f0d156e496deb863',
        measurementId: 'G-V8KKTT2SWE',
      }
    : {
        apiKey: process.env.FIREBASE_KEY || process.env.NEXT_PUBLIC_FIREBASE_KEY,
        authDomain: 'plottr-ci.firebaseapp.com',
        projectId: 'plottr-ci',
        storageBucket: 'plottr-ci.appspot.com',
        messagingSenderId: '733541501381',
        appId: '1:733541501381:web:66827ee4e4cbe58ac8e3ac',
        measurementId: 'G-XHGVVN7KYL',
      }

// Initialize firebase instance (check whether one already exists)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

let _database = null
const database = () => {
  if (_database) return _database
  _database = firebase.firestore()
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window && window.location.hostname === 'plottr.local')
  ) {
    try {
      _database.useEmulator('plottr.local', 8080)
    } catch (error) {
      console.error('Error initialising dev emulator (you can usually safely ignore this):', error)
    }
  }
  return _database
}

let _auth = null
const auth = () => {
  if (_auth) return _auth
  _auth = firebase.auth()
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window && window.location.hostname === 'plottr.local')
  ) {
    _auth.useEmulator('http://plottr.local:9099')
  }
  return _auth
}

let _storage = null
const storage = () => {
  if (_storage) return _storage
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window && window.location.hostname === 'plottr.local')
  ) {
    _storage = firebase.storage()
    _storage.useEmulator('localhost', 9199)
  } else {
    _storage = firebase.storage()
  }
  return _storage
}

export const startUI = (firebaseUI, queryString) => {
  firebaseUI.start(queryString, {
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        disableSignUp: { status: true },
      },
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  })
}

const wiredUp = api(
  auth,
  database,
  storage,
  // For env vars to be read from Next config (on the web) we need to
  // prefix them with 'NEXT_PUBLIC'
  process.env.NEXT_PUBLIC_API_BASE_DOMAIN || process.env.API_BASE_DOMAIN
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

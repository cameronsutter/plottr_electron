import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import api from './api'

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
  _database.settings({ ignoreUndefinedProperties: true }, { merge: true })
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window && window.location.hostname === 'plottr.local')
  ) {
    try {
      _database.useEmulator('plottr.local', 8081)
      _database.settings(
        { ignoreUndefinedProperties: true, host: 'plottr.local:8081', ssl: true },
        { merge: true }
      )
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
  _auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window && window.location.hostname === 'plottr.local')
  ) {
    _auth.useEmulator('https://plottr.local:9100')
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
    _storage.useEmulator('localhost', 9200)
    _storage._delegate.host = 'https://plottr.local:9200'
  } else {
    _storage = firebase.storage()
  }
  return _storage
}

let _firebaseui
const firebaseUI = () => {
  if (_firebaseui) return _firebaseui
  const firebaseui = require('firebaseui')
  _firebaseui = new firebaseui.auth.AuthUI(auth())
  return _firebaseui
}

export const startUI = (queryString) => {
  const ui = firebaseUI()
  ui.start(queryString, {
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

const isElectron =
  (navigator && navigator.userAgent && navigator.userAgent.toLowerCase()).indexOf(' electron/') > -1

export const wireUpAPI = (logger) => {
  const wiredUp = api(
    auth,
    database,
    storage,
    // For env vars to be read from Next config (on the web) we need to
    // prefix them with 'NEXT_PUBLIC'
    process.env.NEXT_PUBLIC_API_BASE_DOMAIN || process.env.API_BASE_DOMAIN,
    process.env.NODE_ENV === 'development',
    logger,
    isElectron
  )

  return {
    editFileName: wiredUp.editFileName,
    listenToFile: wiredUp.listenToFile,
    listenToBeats: wiredUp.listenToBeats,
    listenToCards: wiredUp.listenToCards,
    listenToSeries: wiredUp.listenToSeries,
    listenToBooks: wiredUp.listenToBooks,
    listenToCategories: wiredUp.listenToCategories,
    listenToCharacters: wiredUp.listenToCharacters,
    listenToCustomAttributes: wiredUp.listenToCustomAttributes,
    listenToFeatureFlags: wiredUp.listenToFeatureFlags,
    listenToLines: wiredUp.listenToLines,
    listenToNotes: wiredUp.listenToNotes,
    listenToPlaces: wiredUp.listenToPlaces,
    listenToTags: wiredUp.listenToTags,
    listenToHierarchyLevels: wiredUp.listenToHierarchyLevels,
    listenToImages: wiredUp.listenToImages,
    toFirestoreArray: wiredUp.toFirestoreArray,
    overwriteAllKeys: wiredUp.overwriteAllKeys,
    initialFetch: wiredUp.initialFetch,
    deleteFile: wiredUp.deleteFile,
    listenToFiles: wiredUp.listenToFiles,
    fetchFiles: wiredUp.fetchFiles,
    logOut: wiredUp.logOut,
    mintCookieToken: wiredUp.mintCookieToken,
    onSessionChange: wiredUp.onSessionChange,
    currentUser: wiredUp.currentUser,
    hasUndefinedValue: wiredUp.hasUndefinedValue,
    patch: wiredUp.patch,
    overwrite: wiredUp.overwrite,
    shareDocument: wiredUp.shareDocument,
    releaseRCELock: wiredUp.releaseRCELock,
    lockRCE: wiredUp.lockRCE,
    listenForRCELock: wiredUp.listenForRCELock,
    saveBackup: wiredUp.saveBackup,
    listenForBackups: wiredUp.listenForBackups,
    saveCustomTemplate: wiredUp.saveCustomTemplate,
    allTemplateUrlsForUser: wiredUp.allTemplateUrlsForUser,
    listenToCustomTemplates: wiredUp.listenToCustomTemplates,
    editCustomTemplate: wiredUp.editCustomTemplate,
    deleteCustomTemplate: wiredUp.deleteCustomTemplate,
    saveImageToStorageBlob: wiredUp.saveImageToStorageBlob,
    saveImageToStorageFromURL: wiredUp.saveImageToStorageFromURL,
    backupPublicURL: wiredUp.backupPublicURL,
    imagePublicURL: wiredUp.imagePublicURL,
    isStorageURL: wiredUp.isStorageURL,
    loginWithEmailAndPassword: wiredUp.loginWithEmailAndPassword,
  }
}

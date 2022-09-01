import { initializeApp } from 'firebase/app'
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  onAuthStateChanged,
  indexedDBLocalPersistence,
  EmailAuthProvider,
  signOut,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  query,
  collection,
  where,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  runTransaction,
  addDoc,
} from 'firebase/firestore'
import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from 'firebase/storage'

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
let firebaseApp = null
if (!firebaseApp) {
  firebaseApp = initializeApp(firebaseConfig)
}

let _database = null
const database = () => {
  if (!firebaseApp) return null
  if (!_database) {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
      try {
        console.log(
          'Using database local emulator for environment: ',
          process.env.NEXT_PUBLIC_NODE_ENV
        )
        _database = initializeFirestore(firebaseApp, {
          ignoreUndefinedProperties: true,
          host: 'plottr.local:8081',
          ssl: true,
        })
        connectFirestoreEmulator(_database, 'plottr.local', 8081)
      } catch (error) {
        console.error(
          'Error initialising dev emulator (you can usually safely ignore this):',
          error
        )
      }
    } else {
      _database = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
    }
  }
  return {
    instance: _database,
    query,
    collection: (collectionName) => {
      return collection(_database, collectionName)
    },
    doc: (path) => {
      return doc(_database, path)
    },
    updateDoc,
    where,
    onSnapshot,
    getDoc,
    getDocs,
    setDoc,
    runTransaction: (transaction) => {
      return runTransaction(_database, transaction)
    },
    addDoc,
  }
}

let _auth = null
const auth = () => {
  if (!firebaseApp) return null
  if (!_auth) {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
      console.log('Using auth local emulator for environment: ', process.env.NEXT_PUBLIC_NODE_ENV)
      _auth = getAuth(firebaseApp)
      connectAuthEmulator(_auth, 'https://plottr.local:9100')
      setPersistence(_auth, indexedDBLocalPersistence)
    } else {
      _auth = getAuth(firebaseApp)
      setPersistence(_auth, indexedDBLocalPersistence)
    }
  }
  return {
    instance: _auth,
    onAuthStateChanged: (nextOrObserver, error, completed) => {
      return onAuthStateChanged(_auth, nextOrObserver, error, completed)
    },
    signOut: () => {
      return signOut(_auth)
    },
    currentUser: () => {
      return _auth.currentUser
    },
    signInWithEmailAndPassword: (email, password) => {
      return signInWithEmailAndPassword(_auth, email, password)
    },
  }
}

let _storage = null
const storage = () => {
  if (!firebaseApp) return null
  if (!_storage) {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
      console.log(
        'Using storage local emulator for environment: ',
        process.env.NEXT_PUBLIC_NODE_ENV
      )
      _storage = getStorage(firebaseApp)
      connectStorageEmulator(_storage, 'localhost', 9200)
      _storage._delegate.host = 'https://plottr.local:9200'
    } else {
      _storage = getStorage(firebaseApp)
    }
  }
  return {
    ref: (path) => {
      return ref(_storage, path)
    },
    uploadString,
    getDownloadURL,
    deleteObject,
    uploadBytes,
  }
}

let _firebaseui
const firebaseUI = () => {
  if (_firebaseui) return _firebaseui
  const firebaseui = require('firebaseui')
  _firebaseui = new firebaseui.auth.AuthUI(auth().instance)
  return _firebaseui
}

export const startUI = (queryString) => {
  const ui = firebaseUI()
  ui.start(queryString, {
    signInOptions: [
      {
        provider: EmailAuthProvider.PROVIDER_ID,
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
    process.env.NEXT_PUBLIC_NODE_ENV === 'development',
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

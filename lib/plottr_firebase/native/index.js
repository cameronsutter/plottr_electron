import legacyAPIAuth from '@react-native-firebase/auth'
import legacyAPIDatabase from '@react-native-firebase/firestore'
import legacyAPIStorage from '@react-native-firebase/storage'
import Config from 'react-native-config'

import api from '../src/api'

const { BASE_API_DOMAIN } = Config

legacyAPIDatabase().settings({ ignoreUndefinedProperties: true }, { merge: true })

const auth = () => {
  return {
    instance: legacyAPIAuth(),
    onAuthStateChanged: (nextOrObserver, error, completed) => {
      return legacyAPIAuth().onAuthStateChanged(nextOrObserver, error, completed)
    },
    signOut: () => {
      return legacyAPIAuth().signOut()
    },
    currentUser: () => {
      return legacyAPIAuth().currentUser
    },
    signInWithEmailAndPassword: (email, password) => {
      return legacyAPIAuth().signInWithEmailAndPassword(email, password)
    },
  }
}

const translate = (rootClause) => {
  const translateIter = (ref, ...clauses) => {
    if (clauses.length === 0) {
      return ref
    }

    const clause = clauses[0]
    switch (clause.type) {
      case 'query': {
        return translateIter(ref, clause.clauses)
      }
      case 'where': {
        return translateIter(ref.where(...clause.clauses), clauses.slice(1))
      }
    }
    // Doesn't need to be translated.  (Most likely created by
    // `collection`.)
    return clause
  }

  return translateIter(null, [rootClause])
}

const database = () => {
  return {
    instance: legacyAPIDatabase(),
    query: (...clauses) => {
      return {
        type: 'query',
        clauses,
      }
    },
    collection: (collectionPath) => {
      return legacyAPIDatabase().collection(collectionPath)
    },
    doc: (path) => {
      return legacyAPIDatabase().doc(path)
    },
    updateDoc: (ref, data) => {
      return ref.update(data)
    },
    where: (...clauses) => {
      return {
        type: 'where',
        clauses,
      }
    },
    onSnapshot: (ref, handleSnapshot) => {
      return ref.onSnapshot(handleSnapshot)
    },
    getDoc: (ref) => {
      return ref.get()
    },
    getDocs: (clause) => {
      if (clause.type === 'query') {
        return translate(clause).get()
      }
      return clause.get()
    },
    setDoc: (ref, data, options) => {
      return ref.set(data, options)
    },
    runTransaction: (transaction) => {
      return legacyAPIDatabase().runTransaction(transaction)
    },
    addDoc: (ref, document) => {
      return ref.add(document)
    },
  }
}

const storage = () => {
  return {
    instance: legacyAPIStorage(),
    ref: (path) => {
      return legacyAPIStorage().ref().child(path)
    },
    uploadString: (objectRef, s) => {
      return objectRef.putString(s)
    },
    getDownloadURL: (ref) => {
      return ref.getDownloadURL()
    },
    deleteObject: (path) => {
      return legacyAPIStorage().ref().child(path).delete()
    },
    uploadBytes: (objectRef, bytes) => {
      return objectRef.put(bytes)
    },
  }
}

export const wireUpAPI = (logger) => {
  // Pretend to be desktop because we never run emulators locally.
  const wiredUp = api(auth, database, storage, BASE_API_DOMAIN, __DEV__, logger, true)

  const listen = (withResponse, userId, fileId, clientId, fileVersion) => {
    const unsubscribeToFile = wiredUp.listenToFile(userId, fileId, clientId, withResponse)
    const unsubscribeToBeats = wiredUp.listenToBeats(
      userId,
      fileId,
      clientId,
      fileVersion,
      withResponse
    )
    const unsubscribeToCards = wiredUp.listenToCards(userId, fileId, clientId, withResponse)
    const unsubscribeToSeries = wiredUp.listenToSeries(userId, fileId, clientId, withResponse)
    const unsubscribeToBooks = wiredUp.listenToBooks(userId, fileId, clientId, withResponse)
    const unsubscribeToCategories = wiredUp.listenToCategories(
      userId,
      fileId,
      clientId,
      withResponse
    )
    const unsubscribeToCharacters = wiredUp.listenToCharacters(
      userId,
      fileId,
      clientId,
      withResponse
    )
    const unsubscribeToAttributes = wiredUp.listenToCustomAttributes(
      userId,
      fileId,
      clientId,
      withResponse
    )
    const unsubscribeToFlags = wiredUp.listenToFeatureFlags(userId, fileId, clientId, withResponse)
    const unsubscribeToLines = wiredUp.listenToLines(userId, fileId, clientId, withResponse)
    const unsubscribeToNotes = wiredUp.listenToNotes(userId, fileId, clientId, withResponse)
    const unsubscribeToPlaces = wiredUp.listenToPlaces(userId, fileId, clientId, withResponse)
    const unsubscribeToTags = wiredUp.listenToTags(userId, fileId, clientId, withResponse)
    const unsubscribeToLevels = wiredUp.listenToHierarchyLevels(
      userId,
      fileId,
      clientId,
      withResponse
    )
    const unsubscribeToImages = wiredUp.listenToImages(userId, fileId, clientId, withResponse)
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
    return Promise.resolve(unsubscribe)
  }

  const returningPromise =
    (f) =>
    (...args) => {
      return Promise.resolve(f(...args))
    }

  // Contract for mobile: everything must return a promise except for:
  //  - `toFirestoreArray`,
  //  - `hasUndefinedValue`, &
  //  - `isStorageURL`.
  return {
    editFileName: wiredUp.editFileName,
    updateAuthFileName: wiredUp.updateAuthFileName,
    listen,
    toFirestoreArray: wiredUp.toFirestoreArray,
    overwriteAllKeys: wiredUp.overwriteAllKeys,
    initialFetch: wiredUp.initialFetch,
    deleteFile: wiredUp.deleteFile,
    listenToFiles: wiredUp.listenToFiles,
    fetchFiles: wiredUp.fetchFiles,
    logOut: wiredUp.logOut,
    mintCookieToken: wiredUp.mintCookieToken,
    onSessionChange: wiredUp.onSessionChange,
    currentUser: returningPromise(wiredUp.currentUser),
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
    loginWithEmailAndPassword: (email, password) => {
      console.log('-----> Logging in...')
      return wiredUp.loginWithEmailAndPassword(email, password).then((result) => {
        console.log('-----> Minting cookie...')
        return wiredUp.mintCookieToken().then(() => {
          console.log('-----> Minted cookie...')
          return result
        })
      })
    },
  }
}

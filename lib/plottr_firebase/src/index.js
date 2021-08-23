import firebase from 'firebase/app'
import semverGt from 'semver/functions/gt'
import 'firebase/auth'
import 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

import { actions, ARRAY_KEYS } from 'pltr/v2'

const firebaseConfig =
  process.env.NEXT_PUBLIC_FIREBASE_ENV === 'production'
    ? {
        apiKey: 'AIzaSyDyxfuXIrmXyN4YLlIRBkjA82Guh4XGUEE',
        authDomain: 'plottr.firebaseapp.com',
        databaseURL: 'https://plottr.firebaseio.com',
        projectId: 'plottr',
        storageBucket: 'plottr.appspot.com',
        messagingSenderId: '414647050330',
        appId: '1:414647050330:web:6d0520f0d156e496deb863',
        measurementId: 'G-V8KKTT2SWE',
      }
    : {
        apiKey: 'AIzaSyAwvdLWqVoyhEXbT26aTx0HL_qybstxLFY',
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

export const editFileName = (fileId, newName) => {
  return database().doc(`file/${fileId}`).update({
    fileName: newName,
  })
}

let _database = null
const database = () => {
  if (_database) return _database
  _database = firebase.firestore()
  if (
    process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
    (window && window.location.hostname === 'plottr.local')
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
    (window && window.location.hostname === 'plottr.local')
  ) {
    _auth.useEmulator('http://plottr.local:9099')
  }
  return _auth
}

const patchActions = (path) => {
  switch (path) {
    case 'beats':
      return actions.beat
    case 'books':
      return actions.book
    case 'cards':
      return actions.card
    case 'series':
      return actions.series
    case 'categories':
      return actions.category
    case 'characters':
      return actions.character
    case 'customAttributes':
      return actions.customAttribute
    case 'lines':
      return actions.line
    case 'notes':
      return actions.note
    case 'places':
      return actions.place
    case 'tags':
      return actions.tag
    case 'hierarchyLevels':
      return actions.hierarchyLevels
    case 'images':
      return actions.image
    case 'file':
      return actions.ui
  }
  return null
}

const onSnapshot =
  (
    store,
    fileId,
    path,
    withData,
    patching,
    clientId,
    loadFunctionKey = 'load',
    usingFromDocRef = () => ({})
  ) =>
  (documentRef) => {
    const data = documentRef.data()
    if (!data) {
      console.warn(`No data in firestore at key ${path} for file: ${fileId}`)
      return
    }
    if (data.clientId === clientId) return
    delete data.fileId
    delete data.clientId
    store.dispatch(
      patchActions(path)[loadFunctionKey](
        patching,
        withData({ ...usingFromDocRef(documentRef), ...data })
      )
    )
  }

const listenToFile = (store, userId, fileId, clientId) => {
  const identity = (x) => x
  return database()
    .collection('file')
    .doc(fileId)
    .onSnapshot(
      onSnapshot(store, fileId, 'file', identity, true, clientId, 'patchFile', (x) => ({
        id: x.id,
      }))
    )
}

const listenForObjectAtPath = (path) => (store, userId, fileId, clientId) => {
  const identity = (x) => x
  return database()
    .collection(path)
    .doc(fileId)
    .onSnapshot(onSnapshot(store, fileId, path, identity, true, clientId))
}

const listenForArrayAtPath = (path) => (store, userId, fileId, clientId) => {
  const values = (x) => Object.values(x)
  return database()
    .collection(path)
    .doc(fileId)
    .onSnapshot(onSnapshot(store, fileId, path, values, true, clientId))
}

const listenToBeats = (store, userId, fileId, clientId, version) => {
  const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
    ? (x) => x
    : (x) => Object.values(x)
  return database()
    .collection('beats')
    .doc(fileId)
    .onSnapshot(onSnapshot(store, fileId, 'beats', transform, true, clientId))
}

const listenToCards = listenForArrayAtPath('cards')
const listenToSeries = listenForObjectAtPath('series')
const listenToBooks = listenForObjectAtPath('books')
const listenToCategories = listenForObjectAtPath('categories')
const listenToCharacters = listenForArrayAtPath('characters')
const listenToCustomAttributes = listenForObjectAtPath('customAttributes')
const listenToLines = listenForArrayAtPath('lines')
const listenToNotes = listenForArrayAtPath('notes')
const listenToPlaces = listenForArrayAtPath('places')
const listenToTags = listenForArrayAtPath('tags')
const listenTohierarchyLevels = listenForObjectAtPath('hierarchyLevels')
const listenToImages = listenForObjectAtPath('images')
const listenToClient = listenForObjectAtPath('client')

export const listen = (store, userId, fileId, clientId, fileVersion) => {
  const unsubscribeFunctions = [
    listenToFile(store, userId, fileId, clientId),
    listenToBeats(store, userId, fileId, clientId, fileVersion),
    listenToCards(store, userId, fileId, clientId),
    listenToSeries(store, userId, fileId, clientId),
    listenToBooks(store, userId, fileId, clientId),
    listenToCategories(store, userId, fileId, clientId),
    listenToCharacters(store, userId, fileId, clientId),
    listenToCustomAttributes(store, userId, fileId, clientId),
    listenToLines(store, userId, fileId, clientId),
    listenToNotes(store, userId, fileId, clientId),
    listenToPlaces(store, userId, fileId, clientId),
    listenToTags(store, userId, fileId, clientId),
    listenTohierarchyLevels(store, userId, fileId, clientId),
    listenToImages(store, userId, fileId, clientId),
    listenToClient(store, userId, fileId, clientId),
  ]
  return unsubscribeFunctions
}

const onFetched = (fileId, path, withData, clientId) => (documentRef) => {
  const data = documentRef.data()
  if (!data) {
    console.warn(`No entry for ${path} on file ${fileId}`)
    return {}
  }
  delete data.fileId
  delete data.clientId
  return {
    [path]: withData(data),
  }
}

const fetchArrayAtPath = (path) => (userId, fileId, clientId) => {
  const values = (x) => Object.values(x)
  return database()
    .collection(path)
    .doc(fileId)
    .get()
    .then(onFetched(fileId, path, values, clientId))
}

const fetchObjectAtPath = (path) => (userId, fileId, clientId) => {
  const identity = (x) => x
  return database()
    .collection(path)
    .doc(fileId)
    .get()
    .then(onFetched(fileId, path, identity, clientId))
}

const WHEN_BEATS_BECAME_AN_OBJECT = '2021.4.13'

const fetchBeats = (userId, fileId, clientId, version) => {
  const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
    ? (x) => x
    : (x) => Object.values(x)
  return database()
    .collection('beats')
    .doc(fileId)
    .get()
    .then(onFetched(fileId, 'beats', transform, clientId))
}

const fetchFile = fetchObjectAtPath('file')
const fetchChapters = fetchArrayAtPath('chapters')
const fetchCards = fetchArrayAtPath('cards')
const fetchSeries = fetchObjectAtPath('series')
const fetchBooks = fetchObjectAtPath('books')
const fetchCategories = fetchObjectAtPath('categories')
const fetchCharacters = fetchArrayAtPath('characters')
const fetchCustomAttributes = fetchObjectAtPath('customAttributes')
const fetchLines = fetchArrayAtPath('lines')
const fetchNotes = fetchArrayAtPath('notes')
const fetchPlaces = fetchArrayAtPath('places')
const fetchTags = fetchArrayAtPath('tags')
const fetchhierarchyLevels = fetchObjectAtPath('hierarchyLevels')
const fetchImages = fetchObjectAtPath('images')
const fetchClient = fetchObjectAtPath('client')

export const withFileId = (fileId, file) => ({
  ...file,
  file: {
    ...file.file,
    id: fileId,
  },
})

export const toFirestoreArray = (array) =>
  array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

export const overwriteAllKeys = (fileId, clientId, state) => {
  const results = []
  Object.keys(state).forEach((key) => {
    if (key === 'error' || key === 'permission' || key === 'ui' || key === 'project') return
    const payload = ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(state[key]) : state[key]
    results.push(
      overwrite(key, fileId, payload, clientId).catch((error) => {
        console.error(`Error while force updating file ${fileId}`, error)
      })
    )
  })
  return Promise.all(results)
}

export const initialFetch = (userId, fileId, clientId, version) => {
  return Promise.all([
    fetchFile(userId, fileId, clientId),
    fetchChapters(userId, fileId, clientId),
    fetchBeats(userId, fileId, clientId, version),
    fetchCards(userId, fileId, clientId),
    fetchSeries(userId, fileId, clientId),
    fetchBooks(userId, fileId, clientId),
    fetchCategories(userId, fileId, clientId),
    fetchCharacters(userId, fileId, clientId),
    fetchCustomAttributes(userId, fileId, clientId),
    fetchLines(userId, fileId, clientId),
    fetchNotes(userId, fileId, clientId),
    fetchPlaces(userId, fileId, clientId),
    fetchTags(userId, fileId, clientId),
    fetchhierarchyLevels(userId, fileId, clientId),
    fetchImages(userId, fileId, clientId),
    fetchClient(userId, fileId, clientId),
  ]).then((results) => {
    const json = Object.assign({}, ...results)
    return json
  })
}

export const deleteFile = (fileId, userId, clientId) => {
  const setDeleted = (path) => patch(path, fileId, { deleted: true }, clientId)
  return Promise.all([
    setDeleted('file'),
    setDeleted('cards'),
    setDeleted('series'),
    setDeleted('books'),
    setDeleted('categories'),
    setDeleted('characters'),
    setDeleted('customAttributes'),
    setDeleted('lines'),
    setDeleted('notes'),
    setDeleted('places'),
    setDeleted('tags'),
    setDeleted('hierarchyLevels'),
    setDeleted('images'),
  ])
}

export const stopListening = (unsubscribeFunctions) => {
  unsubscribeFunctions.forEach((fn) => {
    fn()
  })
}

export const fetchFiles = (userId) => {
  return database()
    .collection(`authorisation/${userId}/granted`)
    .get()
    .then((authorisationsRef) => {
      const authorisedDocuments = []
      authorisationsRef.forEach((authorisation) => {
        const document = database()
          .collection(`file`)
          .doc(authorisation.id)
          .get()
          .then((file) => ({
            id: file.id,
            ...file.data(),
            ...authorisation.data(),
          }))
        authorisedDocuments.push(document)
      })
      return Promise.all(authorisedDocuments)
    })
}

export const logOut = () => {
  return auth().signOut()
}

export const onSessionChange = (cb) => {
  return auth().onAuthStateChanged(cb)
}

let _firebaseui
export const firebaseUI = () => {
  if (_firebaseui) return _firebaseui
  const firebaseui = require('firebaseui')
  _firebaseui = new firebaseui.auth.AuthUI(auth())
  return _firebaseui
}

export const startUI = (firebaseUI, queryString) => {
  firebaseUI.start(queryString, {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    ],
  })
}

// Useful for debugging because Firebase rejects keys with undefined
// values.
export const hasUndefinedValue = (object) => {
  if (object === null) return false

  return (
    object === undefined ||
    Object.values(object).some((value) => {
      if (Array.isArray(value)) {
        return value.some(hasUndefinedValue)
      }
      if (typeof value === 'object') {
        return hasUndefinedValue(value)
      }
      return value === undefined
    })
  )
}

export const patch = (path, fileId, payload, clientId) => {
  return database()
    .collection(path)
    .doc(fileId)
    .update({
      ...payload,
      clientId,
      fileId,
    })
}

export const overwrite = (path, fileId, payload, clientId) => {
  return database()
    .collection(path)
    .doc(fileId)
    .set({
      ...payload,
      clientId,
      fileId,
    })
}

export const shareDocument = (fileId, emailAddress) => {
  const invitationToken = uuidv4()
  return database()
    .collection('file')
    .doc(fileId)
    .set(
      { pending: [{ emailAddress, invitationToken, permission: 'collaborator' }] },
      { merge: true }
    )
    .then(() => {
      return invitationToken
    })
}

export const publishRCEOperations = (fileId, editorId, operations) => {
  const modificationsRef = database().collection(`rce/${fileId}/editors/${editorId}/changes`)
  return Promise.all(
    operations.map((operation) => {
      modificationsRef.add(operation)
    })
  )
}

// Orders the edits by time, then tries to keep edits from the same
// editor together while finally ordiring by the number from that
// editor.
export const fetchRCEOperations = (fileId, editorId, since, cb) => {
  database()
    .collection(`rce/${fileId}/editors/${editorId}/changes`)
    .where('created', '>', since)
    .orderBy('created')
    .orderBy('editorKey')
    .orderBy('editNumber')
    .get()
    .then((documentRef) => {
      const documents = []
      documentRef.forEach((document) => {
        documents.push(document.data())
      })
      if (documents.length) cb(documents)
    })
}

export const listenToCustomTemplates = (userId, callback) => {
  return database()
    .collection(`templates/${userId}/custom`)
    .where('deleted', '!=', true)
    .onSnapshot((documentsRef) => {
      console.log('Received updated custom templates.')
      const documents = []
      documentsRef.forEach((document) => {
        documents.push(document.data())
      })
      callback(documents)
      return documents
    })
}

export const saveCustomTemplate = (userId, template) => {
  return database().collection(`templates/${userId}/custom`).doc(template.id).set(template)
}

export const editCustomTemplate = (userId, template) => {
  return database()
    .doc(`templates/${userId}/custom/${template.id}`)
    .update(template, { merge: true })
}

export const deleteCustomTemplate = (userId, templateId) => {
  return database()
    .doc(`templates/${userId}/custom/${templateId}`)
    .update({ deleted: true }, { merge: true })
}

const getSingleDocument = (documentRef) => {
  const documents = []
  documentRef.forEach((document) => {
    documents.push({ document: document.data(), documentRef: document })
  })
  if (documents.length) {
    return documents[0]
  }
  return null
}

const startOfSessionBackup = (userId, file, startOfToday, fileId) => {
  return database()
    .collection(`backup/${userId}/files`)
    .where('fileId', '==', fileId)
    .where('backupTime', '==', startOfToday)
    .where('startOfSession', '==', true)
    .get()
    .then(getSingleDocument)
}

const currentBackup = (userId, file, startOfToday, fileId) => {
  return database()
    .collection(`backup/${userId}/files`)
    .where('fileId', '==', fileId)
    .where('backupTime', '==', startOfToday)
    .where('startOfSession', '==', false)
    .get()
    .then(getSingleDocument)
}

const TEN_SECONDS_IN_MILISECONDS = 10000

export const saveBackup = (userId, file) => {
  const startOfToday = DateTime.now().startOf('day').toJSDate()
  const lastModified = new Date()
  const fileId = file.project.selectedFile.id

  return startOfSessionBackup(userId, file, startOfToday, fileId).then((startOfSession) => {
    // Is there a backup for the start of today?
    if (startOfSession) {
      // Is there a non-start-of-session backup?
      return currentBackup(userId, file, startOfToday, fileId).then((result) => {
        if (result) {
          // Update the current backup
          const { document, documentRef } = result
          const delta = lastModified - document.lastModified.toDate()
          if (delta < TEN_SECONDS_IN_MILISECONDS) {
            return Promise.resolve({ message: 'Not backed up', delta })
          }
          return database()
            .doc(`backup/${userId}/files/${documentRef.id}`)
            .update({
              ...document,
              file,
              lastModified: new Date(),
            })
        }
        // Add a non-start-of-session backup.
        return database().collection(`backup/${userId}/files`).add({
          backupTime: startOfToday,
          file,
          startOfSession: false,
          fileId,
          lastModified: new Date(),
        })
      })
    }
    // Add a start-of-session backup
    return database().collection(`backup/${userId}/files`).add({
      backupTime: startOfToday,
      fileId,
      file,
      startOfSession: true,
    })
  })
}

export const listenForBackups = (userId, onBackupsChanged) => {
  return database()
    .collection('backup/${userId}/files')
    .onSnapshot((documentRef) => {
      onBackupsChanged(documentRef.data())
    })
}

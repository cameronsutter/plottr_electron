import semverGt from 'semver/functions/gt'
import axios from 'axios'
import { DateTime, Duration } from 'luxon'

import { actions, ARRAY_KEYS } from 'pltr/v2'

/**
 * auth, database and storage should be thunks that produce instances
 * of the correspending firebase objects from either the firebase JS
 * api or the react-native-firebase api.
 */
const api = (auth, database, storage, baseAPIDomain, development) => {
  const pingAuth = (userId, fileId) => {
    return axios.post(`https://${baseAPIDomain || ''}/api/ping-auth`, {
      userId,
      fileId
    })
  }

  const editFileName = (userId, fileId, newName) => {
    return database()
      .doc(`file/${fileId}`)
      .update({
        fileName: newName
      })
      .then(() => {
        pingAuth(userId, fileId)
      })
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
      case 'featureFlags':
        return actions.featureFlags
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
      const data = documentRef && documentRef.data()
      if (!data) {
        console.warn(`No data in firestore at key ${path} for file: ${fileId}`)
        return
      }
      if (data.clientId === clientId) return
      const patchAction = patchActions(path)
      if (!patchAction) {
        console.error('No patch action for ', path)
        return
      }
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
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId })
    return database()
      .collection('file')
      .doc(fileId)
      .onSnapshot(
        onSnapshot(store, fileId, 'file', withIsCloud, true, clientId, 'patchFile', (x) => ({
          id: x.id
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

  const WHEN_BEATS_BECAME_AN_OBJECT = '2021.4.13'

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
  const listenToFeatureFlags = listenForObjectAtPath('featureFlags')
  const listenToLines = listenForArrayAtPath('lines')
  const listenToNotes = listenForArrayAtPath('notes')
  const listenToPlaces = listenForArrayAtPath('places')
  const listenToTags = listenForArrayAtPath('tags')
  const listenTohierarchyLevels = listenForObjectAtPath('hierarchyLevels')
  const listenToImages = listenForObjectAtPath('images')
  const listenToClient = listenForObjectAtPath('client')

  const listen = (store, userId, fileId, clientId, fileVersion) => {
    const unsubscribeFunctions = [
      listenToFile(store, userId, fileId, clientId),
      listenToBeats(store, userId, fileId, clientId, fileVersion),
      listenToCards(store, userId, fileId, clientId),
      listenToSeries(store, userId, fileId, clientId),
      listenToBooks(store, userId, fileId, clientId),
      listenToCategories(store, userId, fileId, clientId),
      listenToCharacters(store, userId, fileId, clientId),
      listenToCustomAttributes(store, userId, fileId, clientId),
      listenToFeatureFlags(store, userId, fileId, clientId),
      listenToLines(store, userId, fileId, clientId),
      listenToNotes(store, userId, fileId, clientId),
      listenToPlaces(store, userId, fileId, clientId),
      listenToTags(store, userId, fileId, clientId),
      listenTohierarchyLevels(store, userId, fileId, clientId),
      listenToImages(store, userId, fileId, clientId),
      listenToClient(store, userId, fileId, clientId)
    ]
    return unsubscribeFunctions
  }

  const onFetched = (fileId, path, withData, clientId) => (documentRef) => {
    const data = documentRef && documentRef.data()
    if (!data) {
      console.warn(`No entry for ${path} on file ${fileId}`)
      return {}
    }
    delete data.fileId
    delete data.clientId
    return {
      [path]: withData(data)
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

  const fetchFile = (userId, fileId, clientId) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId })
    const path = 'file'
    return database()
      .doc(`authorisation/${userId}/granted/${fileId}`)
      .get()
      .then((authorisationRef) => {
        const withAuthorisation = (x) => withIsCloud({ ...x, ...authorisationRef.data() })
        return database()
          .collection(path)
          .doc(fileId)
          .get()
          .then(onFetched(fileId, path, withAuthorisation, clientId))
      })
  }

  const fetchChapters = fetchArrayAtPath('chapters')
  const fetchCards = fetchArrayAtPath('cards')
  const fetchSeries = fetchObjectAtPath('series')
  const fetchBooks = fetchObjectAtPath('books')
  const fetchCategories = fetchObjectAtPath('categories')
  const fetchCharacters = fetchArrayAtPath('characters')
  const fetchCustomAttributes = fetchObjectAtPath('customAttributes')
  const fetchEditors = fetchObjectAtPath('featureFlags')
  const fetchLines = fetchArrayAtPath('lines')
  const fetchNotes = fetchArrayAtPath('notes')
  const fetchPlaces = fetchArrayAtPath('places')
  const fetchTags = fetchArrayAtPath('tags')
  const fetchhierarchyLevels = fetchObjectAtPath('hierarchyLevels')
  const fetchImages = fetchObjectAtPath('images')
  const fetchClient = fetchObjectAtPath('client')

  const toFirestoreArray = (array) =>
    array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

  const overwriteAllKeys = (fileId, clientId, state) => {
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

  const initialFetch = (userId, fileId, clientId, version) => {
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
      fetchEditors(userId, fileId, clientId),
      fetchLines(userId, fileId, clientId),
      fetchNotes(userId, fileId, clientId),
      fetchPlaces(userId, fileId, clientId),
      fetchTags(userId, fileId, clientId),
      fetchhierarchyLevels(userId, fileId, clientId),
      fetchImages(userId, fileId, clientId),
      fetchClient(userId, fileId, clientId)
    ]).then((results) => {
      const json = Object.assign({}, ...results)
      return json
    })
  }

  const deleteFile = (fileId, userId, clientId) => {
    const setDeleted = (path) => patch(path, fileId, { deleted: true }, clientId)
    const setDeletedfile = () => setDeleted('file')
    const setDeletedcards = () => setDeleted('cards')
    const setDeletedseries = () => setDeleted('series')
    const setDeletedbooks = () => setDeleted('books')
    const setDeletedcategories = () => setDeleted('categories')
    const setDeletedcharacters = () => setDeleted('characters')
    const setDeletedcustomAttributes = () => setDeleted('customAttributes')
    const setDeletedlines = () => setDeleted('lines')
    const setDeletednotes = () => setDeleted('notes')
    const setDeletedplaces = () => setDeleted('places')
    const setDeletedtags = () => setDeleted('tags')
    const setDeletedhierarchyLevels = () => setDeleted('hierarchyLevels')
    const setDeletedimages = () => setDeleted('images')

    return setDeletedfile().then((deleteFileResult) =>
      pingAuth(userId, fileId).then((pingAuthResult) =>
        Promise.all([
          setDeletedcards(),
          setDeletedseries(),
          setDeletedbooks(),
          setDeletedcategories(),
          setDeletedcharacters(),
          setDeletedcustomAttributes(),
          setDeletedlines(),
          setDeletednotes(),
          setDeletedplaces(),
          setDeletedtags(),
          setDeletedhierarchyLevels(),
          setDeletedimages()
        ]).then((results) => [pingAuthResult, deleteFileResult, ...results])
      )
    )
  }

  const stopListening = (unsubscribeFunctions) => {
    unsubscribeFunctions.forEach((fn) => {
      fn()
    })
  }

  const listenToFiles = (userId, callback) => {
    return database()
      .collection(`authorisation/${userId}/granted`)
      .onSnapshot(
        (authorisationsRef) => {
          const authorisedDocuments = []
          authorisationsRef.forEach((authorisation) => {
            const document = database()
              .collection(`file`)
              .doc(authorisation.id)
              .get()
              .then((file) => ({
                id: file.id,
                ...file.data(),
                ...authorisation.data()
              }))
            authorisedDocuments.push(document)
          })
          Promise.all(authorisedDocuments)
            .then((documents) => {
              return documents.map((document) => {
                return {
                  ...document,
                  isCloudFile: true
                }
              })
            })
            .then((authorisedDocuments) => {
              callback(authorisedDocuments)
            })
        },
        (error) => {
          console.error('Error listening to files', error)
        }
      )
  }

  const fetchFiles = (userId) => {
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
              ...authorisation.data()
            }))
          authorisedDocuments.push(document)
        })
        return Promise.all(authorisedDocuments).then((documents) => {
          return documents.map((document) => {
            return {
              ...document,
              isCloudFile: true
            }
          })
        })
      })
  }

  const logOut = () => {
    return auth().signOut()
  }

  const mintCookieToken = (user) => {
    return user.getIdToken().then((idToken) => {
      // do not remove this comment
      return fetch(`https://${baseAPIDomain || ''}/api/mint-token`, {
        method: 'POST',
        body: JSON.stringify({ idToken }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
    })
  }

  const onSessionChange = (cb) => {
    return auth().onAuthStateChanged((user) => {
      if (user) {
        return mintCookieToken(user).then(() => {
          cb(user)
          return Promise.resolve(null)
        })
      }
      cb(user)
      return Promise.resolve(null)
    })
  }

  let _firebaseui
  const firebaseUI = () => {
    if (_firebaseui) return _firebaseui
    const firebaseui = require('firebaseui')
    _firebaseui = new firebaseui.auth.AuthUI(auth())
    return _firebaseui
  }

  const currentUser = () => {
    return auth().currentUser
  }

  // Useful for debugging because Firebase rejects keys with undefined
  // values.
  const hasUndefinedValue = (object) => {
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

  const patch = (path, fileId, payload, clientId) => {
    return database()
      .collection(path)
      .doc(fileId)
      .update({
        ...payload,
        clientId,
        fileId
      })
  }

  const overwrite = (path, fileId, payload, clientId) => {
    return database()
      .collection(path)
      .doc(fileId)
      .set({
        ...payload,
        clientId,
        fileId
      })
  }

  const shareDocument = (userId, fileId, emailAddress, permission) => {
    return axios
      .post(`https://${baseAPIDomain || ''}/api/share-document`, {
        fileId,
        emailAddress,
        userId,
        permission
      })
      .then(() => {
        return database()
          .collection('file')
          .doc(fileId)
          .get()
          .then((documentRef) => {
            const document = documentRef && documentRef.data()
            const existingShareRecord = document.shareRecords.find(
              (shareRecord) => shareRecord.emailAddress === emailAddress
            )
            if (existingShareRecord) {
              return pingAuth(userId, fileId)
            }
            return database()
              .collection('file')
              .doc(fileId)
              .set(
                {
                  shareRecords: [...document.shareRecords, { emailAddress, permission }]
                },
                { merge: true }
              )
              .then(() => {
                return pingAuth(userId, fileId)
              })
          })
      })
  }

  const publishRCEOperations = (fileId, editorId, editorKey, operations) => {
    const modificationsRef = database().collection(`rce/${fileId}/editors/${editorId}/changes`)
    const updateEditNumbersJob = operations.length
      ? database()
          .doc(`rce/${fileId}/editors/${editorId}/editTimestamps/${editorKey}`)
          .set(
            {
              timeStamp: new Date(),
              editNumber: operations[operations.length - 1].editNumber,
              editorKey
            },
            {
              merge: true
            }
          )
      : Promise.resolve([])
    return Promise.all([
      updateEditNumbersJob,
      ...operations.map((operation) => {
        modificationsRef.add(operation)
      })
    ])
  }

  const catchupEditsSeen = (fileId, editorId, myEditorKey, otherEditorKey, since) => {
    database()
      .doc(`rce/${fileId}/editors/${editorId}/editTimestamps/${myEditorKey}`)
      .update({
        timeStamp: new Date(),
        [otherEditorKey]: since
      })
  }

  const releaseRCELock = (fileId, editorId) => {
    return database().doc(`rce/${fileId}/editors/${editorId}/locks/current`).delete()
  }

  const lockRCE = (fileId, editorId, clientId, emailAddress = '') => {
    return database().doc(`rce/${fileId}/editors/${editorId}/locks/current`).set({
      clientId,
      emailAddress
    })
  }

  const listenForRCELock = (fileId, editorId, clientId, cb) => {
    return database()
      .doc(`rce/${fileId}/editors/${editorId}/locks/current`)
      .onSnapshot((documentRef) => {
        const data = documentRef && documentRef.data()
        if (!data) {
          console.log("Didn't find a lock for RCE with editorId", editorId)
          cb({ clientId: null })
          return
        }
        cb(data)
      })
  }

  const listenForChangesToEditor = (fileId, editorId, cb) => {
    database()
      .collection(`rce/${fileId}/editors/${editorId}/editTimestamps`)
      .onSnapshot((documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        cb(documents)
      })
  }

  const deleteResults = (documentsRef) => {
    const deleteTasks = []
    documentsRef.docs.forEach((document) => {
      deleteTasks.push(document.ref.delete())
    })
    return Promise.all(deleteTasks)
  }

  const deleteChangeSignal = (fileId, editorId, editorKey) => {
    return database().doc(`rce/${fileId}/editors/${editorId}/editTimestamps/${editorKey}`).delete()
  }

  const ONE_MINUTE = 60 * 1000

  const deleteOldChanges = (fileId, editorId) => {
    const aMinuteAgo = DateTime.now().minus(Duration.fromMillis(ONE_MINUTE)).toJSDate()

    return database()
      .collection(`rce/${fileId}/editors/${editorId}/changes`)
      .where('created', '<', aMinuteAgo)
      .get()
      .then(deleteResults)
  }

  // Orders the edits by time, then tries to keep edits from the same
  // editor together while finally ordiring by the number from that
  // editor.
  const fetchRCEOperations = (fileId, editorId, since, editorKey, cb) => {
    database()
      .collection(`rce/${fileId}/editors/${editorId}/changes`)
      .where('editorKey', '==', editorKey)
      .where('editNumber', '>', since)
      .orderBy('editNumber')
      .get()
      .then((documentRef) => {
        const documents = []
        if (documentRef) {
          documentRef.forEach((document) => {
            documents.push(document.data())
          })
        }
        if (documents.length) cb(documents)
      })
  }

  const getSingleDocument = (documentRef) => {
    const documents = []
    if (documentRef) {
      documentRef.forEach((document) => {
        documents.push({ document: document.data(), documentRef: document })
      })
    }
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

  const saveBackup = (userId, file) => {
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
            if (delta < TEN_SECONDS_IN_MILISECONDS || !documentRef) {
              return Promise.resolve({ message: 'Not backed up', delta })
            }
            return backupToStorage(userId, file, startOfToday, false).then((path) => {
              return database()
                .doc(`backup/${userId}/files/${documentRef.id}`)
                .update({
                  ...document,
                  storagePath: path,
                  lastModified: new Date()
                })
            })
          }
          // Add a non-start-of-session backup.
          return backupToStorage(userId, file, startOfToday, false).then((path) => {
            return database().collection(`backup/${userId}/files`).add({
              backupTime: startOfToday,
              storagePath: path,
              startOfSession: false,
              fileId,
              fileName: file.project.selectedFile.fileName,
              lastModified: new Date()
            })
          })
        })
      }
      // Add a start-of-session backup
      return backupToStorage(userId, file, startOfToday, true).then((path) => {
        return database().collection(`backup/${userId}/files`).add({
          backupTime: startOfToday,
          fileId,
          storagePath: path,
          fileName: file.project.selectedFile.fileName,
          startOfSession: true,
          lastModified: new Date()
        })
      })
    })
  }

  const listenForBackups = (userId, onBackupsChanged) => {
    return database()
      .collection(`backup/${userId}/files`)
      .onSnapshot((documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        onBackupsChanged(documents)
      })
  }

  const formatDate = (date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  }

  const toBackupPath = (userId, fileId, date, startOfSession) => {
    return `storage://backups/${userId}/${fileId}/${formatDate(date)}${
      startOfSession ? '-(start-of-session)' : ''
    }.pltr`
  }

  const withoutStorageProtocal = (path) => {
    const split = path.split(/[a-zA-Z0-9]+:\/\//g)
    if (split.length > 1) return split[1]
    return split
  }

  const backupToStorage = (userId, file, date, startOfSession) => {
    const fileId = file.project.selectedFile.id
    const filePath = toBackupPath(userId, fileId, date, startOfSession)
    const storageTask = storage()
      .ref()
      .child(withoutStorageProtocal(filePath))
      .putString(JSON.stringify(file))
    return new Promise((resolve, reject) =>
      storageTask.then(() => {
        resolve(filePath)
      }, reject)
    )
  }

  const toTemplatePath = (userId, templateId) => {
    return `storage://userTemplates/${userId}/${templateId}`
  }

  const saveCustomTemplate = (userId, template) => {
    const filePath = toTemplatePath(userId, template.id)
    const storageTask = storage()
      .ref()
      .child(withoutStorageProtocal(filePath))
      .putString(JSON.stringify(template))
    return storageTask.then(() => {
      // Bumping the timestamp will guarantee that listeners fetch
      // the latest versions.
      return database()
        .doc(`templates/${userId}/userTemplates/${template.id}`)
        .set({ id: template.id, path: filePath, timeStamp: new Date() })
    })
  }

  const allTemplateUrlsForUser = (documents) => {
    return Promise.all(
      documents.map(({ path }) =>
        storage().ref().child(withoutStorageProtocal(path)).getDownloadURL()
      )
    )
  }

  const listenToCustomTemplates = (userId, callback) => {
    return database()
      .collection(`templates/${userId}/userTemplates`)
      .onSnapshot((documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        allTemplateUrlsForUser(documents)
          .then((urls) =>
            Promise.all(urls.map((url) => fetch(url).then((response) => response.json())))
          )
          .then(callback)
      })
  }

  const editCustomTemplate = saveCustomTemplate

  const deleteCustomTemplate = (userId, templateId) => {
    return storage()
      .ref()
      .child(`userTemplates/${templateId}`)
      .delete()
      .then((result) => {
        database().doc(`templates/${userId}/userTemplates/${templateId}`).delete()
      })
  }

  const toImagePath = (userId, imageName) => {
    return `storage://images/${userId}/${imageName}`
  }

  const imagetoBlob = (imageUrl) => {
    return fetch(imageUrl).then((response) => response.blob())
  }

  const saveImageToStorageBlob = (userId, imageName, imageBlob) => {
    const filePath = toImagePath(userId, imageName)
    const storageTask = storage().ref().child(withoutStorageProtocal(filePath)).put(imageBlob)
    return new Promise((resolve, reject) => {
      return storageTask.then(() => {
        resolve(filePath)
      }, reject)
    })
  }

  const saveImageToStorageFromURL = (userId, imageName, imageUrl) => {
    return imagetoBlob(imageUrl).then((response) => {
      return saveImageToStorageBlob(userId, imageName, response.blob())
    })
  }

  const backupPublicURL = (storageProtocolURL) => {
    return storage().ref().child(withoutStorageProtocal(storageProtocolURL)).getDownloadURL()
  }

  const imagePublicURL = (storageProtocolURL) => {
    return storage().ref().child(withoutStorageProtocal(storageProtocolURL)).getDownloadURL()
  }

  const isStorageURL = (string) => {
    return string.startsWith('storage://')
  }

  return {
    editFileName,
    listen,
    toFirestoreArray,
    overwriteAllKeys,
    initialFetch,
    deleteFile,
    stopListening,
    listenToFiles,
    fetchFiles,
    logOut,
    mintCookieToken,
    onSessionChange,
    firebaseUI,
    currentUser,
    hasUndefinedValue,
    patch,
    overwrite,
    shareDocument,
    publishRCEOperations,
    catchupEditsSeen,
    releaseRCELock,
    lockRCE,
    listenForRCELock,
    listenForChangesToEditor,
    deleteChangeSignal,
    deleteOldChanges,
    fetchRCEOperations,
    saveBackup,
    listenForBackups,
    saveCustomTemplate,
    allTemplateUrlsForUser,
    listenToCustomTemplates,
    editCustomTemplate,
    deleteCustomTemplate,
    saveImageToStorageBlob,
    saveImageToStorageFromURL,
    backupPublicURL,
    imagePublicURL,
    isStorageURL
  }
}

export default api

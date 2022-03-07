import semverGt from 'semver/functions/gt'
import axios from 'axios'
import { DateTime } from 'luxon'
import { isEqual } from 'lodash'

import { actions, selectors, ARRAY_KEYS, SYSTEM_REDUCER_KEYS } from 'pltr/v2'

/**
 * auth, database and storage should be thunks that produce instances
 * of the correspending firebase objects from either the firebase JS
 * api or the react-native-firebase api.
 */
const api = (auth, database, storage, baseAPIDomain, development, log, isDesktop) => {
  const BASE_API_URL =
    (!isDesktop && development) || !baseAPIDomain ? '' : `https://${baseAPIDomain || ''}`

  const defaultErrorHandler = (error) => {
    log.error('Error communicating with Firebase.', error)
  }

  const pingAuth = (userId, fileId) => {
    return axios
      .post(`${BASE_API_URL}/api/ping-auth`, {
        userId,
        fileId,
      })
      .then((response) => ({
        userId,
        fileId,
      }))
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error(
          'Error pinging auth (to signal that the file list was updated)',
          status,
          error.response
        )
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const editFileName = (userId, fileId, newName) => {
    return database()
      .doc(`file/${fileId}`)
      .update({
        fileName: newName,
      })
      .then(() => {
        return pingAuth(userId, fileId)
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
      withAction,
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
        log.warn(`No data in firestore at key ${path} for file: ${fileId}`)
        return
      }
      if (data.clientId === clientId) return
      const patchAction = patchActions(path)
      if (!patchAction) {
        log.error('No patch action for ', path)
        return
      }
      delete data.fileId
      delete data.clientId
      withAction(
        patchActions(path)[loadFunctionKey](
          patching,
          withData({ ...usingFromDocRef(documentRef), ...data })
        )
      )
    }

  const listenToFile = (
    userId,
    fileId,
    clientId,
    withAction,
    errorHandler = defaultErrorHandler
  ) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId, path: `plottr://${fileId}` })
    return database()
      .collection('file')
      .doc(fileId)
      .onSnapshot(
        onSnapshot(withAction, fileId, 'file', withIsCloud, true, clientId, 'patchFile', (x) => ({
          id: x.id,
        })),
        errorHandler
      )
  }

  const listenForObjectAtPath =
    (path) =>
    (userId, fileId, clientId, withAction, errorHandler = defaultErrorHandler) => {
      const identity = (x) => x
      return database()
        .collection(path)
        .doc(fileId)
        .onSnapshot(onSnapshot(withAction, fileId, path, identity, true, clientId), errorHandler)
    }

  const listenForArrayAtPath =
    (path) =>
    (userId, fileId, clientId, withAction, errorHandler = defaultErrorHandler) => {
      const values = (x) => Object.values(x)
      return database()
        .collection(path)
        .doc(fileId)
        .onSnapshot(onSnapshot(withAction, fileId, path, values, true, clientId), errorHandler)
    }

  const WHEN_BEATS_BECAME_AN_OBJECT = '2021.4.13'

  const listenToBeats = (
    userId,
    fileId,
    clientId,
    version,
    withAction,
    errorHandler = defaultErrorHandler
  ) => {
    const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
      ? (x) => x
      : (x) => Object.values(x)
    return database()
      .collection('beats')
      .doc(fileId)
      .onSnapshot(onSnapshot(withAction, fileId, 'beats', transform, true, clientId), errorHandler)
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
  const listenToHierarchyLevels = listenForObjectAtPath('hierarchyLevels')
  const listenToImages = listenForObjectAtPath('images')

  const onFetched = (fileId, path, withData, clientId) => (documentRef) => {
    const data = documentRef && documentRef.data()
    if (!data) {
      log.warn(`No entry for ${path} on file ${fileId}`)
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

  const toFirestoreArray = (array) =>
    array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

  const overwriteAllKeys = (fileId, clientId, state) => {
    const requests = []
    Object.keys(state).forEach((key) => {
      if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) {
        return
      }
      const payload = ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(state[key]) : state[key]
      requests.push(
        overwrite(key, fileId, payload, clientId)
          .catch((error) => {
            log.error(`Error while force updating file ${fileId} at key: ${key}`, error)
          })
          .then(() => ({
            [key]: ARRAY_KEYS.indexOf(key) !== -1 ? Object.values(payload) : payload,
          }))
      )
    })
    return Promise.all(requests).then((results) => {
      return Object.assign({}, ...results)
    })
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
    ])
      .then((results) => {
        const newOpenDate = new Date()
        return patch('file', fileId, { lastOpened: newOpenDate }, clientId)
          .catch((error) => {
            log.info(`Attempted to update file (${fileId}) timestamp and couldn't`, error)
            return {
              results,
              newOpenDate,
            }
          })
          .then(() => {
            return {
              results,
              newOpenDate,
            }
          })
      })
      .then(({ results, newOpenDate }) => {
        const json = Object.assign({}, ...results)
        return pingAuth(userId, fileId).then(() => {
          return {
            ...json,
            file: {
              ...json.file,
              lastOpened: newOpenDate,
            },
          }
        })
      })
  }

  const deleteFile = (fileId, userId, clientId) => {
    const setDeleted = (path) => patch(path, fileId, { deleted: true }, clientId)
    const setDeletedfile = () => setDeleted('file')
    const setDeletedCards = () => setDeleted('cards')
    const setDeletedSeries = () => setDeleted('series')
    const setDeletedBooks = () => setDeleted('books')
    const setDeletedCategories = () => setDeleted('categories')
    const setDeletedCharacters = () => setDeleted('characters')
    const setDeletedCustomAttributes = () => setDeleted('customAttributes')
    const setDeletedLines = () => setDeleted('lines')
    const setDeletedNotes = () => setDeleted('notes')
    const setDeletedPlaces = () => setDeleted('places')
    const setDeletedTags = () => setDeleted('tags')
    const setDeletedHierarchyLevels = () => setDeleted('hierarchyLevels')
    const setDeletedImages = () => setDeleted('images')

    return setDeletedfile().then((deleteFileResult) =>
      pingAuth(userId, fileId).then((pingAuthResult) =>
        Promise.all([
          setDeletedCards(),
          setDeletedSeries(),
          setDeletedBooks(),
          setDeletedCategories(),
          setDeletedCharacters(),
          setDeletedCustomAttributes(),
          setDeletedLines(),
          setDeletedNotes(),
          setDeletedPlaces(),
          setDeletedTags(),
          setDeletedHierarchyLevels(),
          setDeletedImages(),
        ]).then((results) => [pingAuthResult, deleteFileResult, ...results])
      )
    )
  }

  const listenToFiles = (userId, callback, errorHandler = defaultErrorHandler) => {
    return database()
      .collection(`authorisation/${userId}/granted`)
      .onSnapshot(
        (authorisationsRef) => {
          const authorisedDocuments = []
          authorisationsRef.forEach((authorisation) => {
            const document = database()
              .collection('file')
              .doc(authorisation.id)
              .get()
              .then((file) => ({
                id: file.id,
                ...file.data(),
                ...authorisation.data(),
                path: `plottr://${file.id}`,
              }))
            authorisedDocuments.push(document)
          })
          Promise.all(authorisedDocuments)
            .then((documents) => {
              return documents.map((document) => {
                return {
                  ...document,
                  isCloudFile: true,
                }
              })
            })
            .then((authorisedDocuments) => {
              callback(authorisedDocuments)
            })
        },
        (error) => {
          log.error('Error listening to files', error)
          errorHandler(error)
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
              ...authorisation.data(),
              path: `plottr://${file.id}`,
            }))
          authorisedDocuments.push(document)
        })
        return Promise.all(authorisedDocuments).then((documents) => {
          return documents.map((document) => {
            return {
              ...document,
              isCloudFile: true,
            }
          })
        })
      })
  }

  const logOut = () => {
    return auth().signOut()
  }

  const mintCookieToken = () => {
    return currentUser()
      .getIdToken()
      .then((idToken) => {
        // do not remove this comment
        return fetch(`${BASE_API_URL}/api/mint-token`, {
          method: 'POST',
          body: JSON.stringify({ idToken }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
      })
  }

  const onSessionChange = (cb, errorHandler = defaultErrorHandler) => {
    return auth().onAuthStateChanged((user) => {
      if (user) {
        return mintCookieToken(user).then(() => {
          cb(user)
          return Promise.resolve(null)
        })
      }
      cb(user)
      return Promise.resolve(null)
    }, errorHandler)
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
        fileId,
      })
  }

  const overwrite = (path, fileId, payload, clientId) => {
    return database()
      .collection(path)
      .doc(fileId)
      .set({
        ...payload,
        clientId,
        fileId,
      })
  }

  const shareDocument = (userId, fileId, emailAddress, permission) => {
    return axios
      .post(`${BASE_API_URL}/api/share-document`, {
        fileId,
        emailAddress,
        userId,
        permission,
      })
      .then(() => {
        return database()
          .collection('file')
          .doc(fileId)
          .get()
          .then((documentRef) => {
            const document = documentRef && documentRef.data()
            const shareRecords = document.shareRecords || []
            const existingShareRecord = shareRecords.find(
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
                  shareRecords: [...shareRecords, { emailAddress, permission }],
                },
                { merge: true }
              )
              .then(() => {
                return pingAuth(userId, fileId)
              })
          })
      })
      .catch((error) => {
        const message = error?.message
        const status = error?.response?.status
        log.error('Error sharing document', message, status, error)
        if (error?.response?.status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const releaseRCELock = (fileId, editorId, expectedLock) => {
    const lockReference = database().doc(`rce/${fileId}/editors/${editorId}/locks/current`)
    return database()
      .runTransaction((transactions) => {
        return transactions.get(lockReference).then((lock) => {
          if (!lock.exists) {
            return Promise.reject(
              `Lock for file: ${fileId}, and editor: ${editorId} doesn't exist!`
            )
          }
          if (isEqual(lock.data(), expectedLock)) {
            return transactions.update(lockReference, { clientId: null })
          }
          return Promise.resolve('Lock modified by another client or request')
        })
      })
      .then(() => {
        return database()
          .doc(`rce/${fileId}/editors/${editorId}/locks/current`)
          .get()
          .then((ref) => {
            return ref.data()
          })
      })
  }

  const lockRCE = (fileId, editorId, clientId, expectedLock, emailAddress = '') => {
    const lockReference = database().doc(`rce/${fileId}/editors/${editorId}/locks/current`)
    return database()
      .runTransaction((transactions) => {
        return transactions.get(lockReference).then((lock) => {
          if (!lock.exists) {
            return lockReference.set({
              clientId,
              emailAddress,
            })
          }
          if (isEqual(lock.data(), expectedLock)) {
            return transactions.set(lockReference, {
              clientId,
              emailAddress,
            })
          }

          return Promise.resolve('Lock modified by another client or request')
        })
      })
      .then(() => {
        return database()
          .doc(`rce/${fileId}/editors/${editorId}/locks/current`)
          .get()
          .then((ref) => ref.data())
      })
  }

  const listenForRCELock = (fileId, editorId, clientId, cb) => {
    return database()
      .doc(`rce/${fileId}/editors/${editorId}/locks/current`)
      .onSnapshot((documentRef) => {
        const data = documentRef && documentRef.data()
        if (!data) {
          cb({ clientId: null })
          return
        }
        cb(data)
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
    const fileId = selectors.fileIdSelector(file)
    const fileName = selectors.fileNameSelector(file)

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
                  fileName,
                  storagePath: path,
                  lastModified: new Date(),
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
              fileName,
              lastModified: new Date(),
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
          fileName,
          startOfSession: true,
          lastModified: new Date(),
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
    const fileId = selectors.fileIdSelector(file)
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

  const listenToCustomTemplates = (userId, callback, errorHandler = defaultErrorHandler) => {
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
          .catch(errorHandler)
      }, errorHandler)
  }

  const editCustomTemplate = saveCustomTemplate

  const deleteCustomTemplate = (userId, templateId) => {
    return storage()
      .ref()
      .child(`userTemplates/${userId}/${templateId}`)
      .delete()
      .then((result) => {
        database().doc(`templates/${userId}/userTemplates/${templateId}`).delete()
      })
  }

  const escapeImageName = (imageName) => {
    return imageName.replace(/\//g, '__').replace(/:/g, '--')
  }

  const toImagePath = (userId, imageName) => {
    return `storage://images/${userId}/${escapeImageName(imageName)}`
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
      return saveImageToStorageBlob(userId, imageName, response)
    })
  }

  const backupPublicURL = (storageProtocolURL) => {
    return storage().ref().child(withoutStorageProtocal(storageProtocolURL)).getDownloadURL()
  }

  const imagePublicURL = (storageProtocolURL, fileId, userId) => {
    if (development) {
      return storage().ref().child(withoutStorageProtocal(storageProtocolURL)).getDownloadURL()
    }
    return axios
      .get(
        `${BASE_API_URL}/api/image-public-url?url=${storageProtocolURL}&fileId=${fileId}&userId=${userId}`
      )
      .then((response) => {
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error?.response?.status
        log.error('Error getting image public url', status, error?.response, error)
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const isStorageURL = (string) => {
    return string.startsWith('storage://')
  }

  const loginWithEmailAndPassword = (userName, password) => {
    return auth().signInWithEmailAndPassword(userName, password)
  }

  return {
    editFileName,
    listenToFile,
    listenToBeats,
    listenToCards,
    listenToSeries,
    listenToBooks,
    listenToCategories,
    listenToCharacters,
    listenToCustomAttributes,
    listenToFeatureFlags,
    listenToLines,
    listenToNotes,
    listenToPlaces,
    listenToTags,
    listenToHierarchyLevels,
    listenToImages,
    toFirestoreArray,
    overwriteAllKeys,
    initialFetch,
    deleteFile,
    listenToFiles,
    fetchFiles,
    logOut,
    mintCookieToken,
    onSessionChange,
    currentUser,
    hasUndefinedValue,
    patch,
    overwrite,
    shareDocument,
    releaseRCELock,
    lockRCE,
    listenForRCELock,
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
    isStorageURL,
    loginWithEmailAndPassword,
  }
}

export default api

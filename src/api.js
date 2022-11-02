import semverGt from 'semver/functions/gt'
import axios from 'axios'
import { DateTime } from 'luxon'
import { isEqual } from 'lodash'

import { removeSystemKeys, actions, selectors, ARRAY_KEYS, SYSTEM_REDUCER_KEYS } from 'pltr/v2'

const doNothingWithPartialResult = () => {}

const sequencePromiseThunks = (log, batchSize = 10) => (thunks, onPartialResult = doNothingWithPartialResult) => {
  return new Promise((resolve, reject) => {
    const iter = (results, remainingThunks) => {
      if (remainingThunks.length === 0) {
        resolve(results)
        return
      }

      const nextThunks = remainingThunks.slice(0, 10)
      Promise.all(
        nextThunks.map((f) => {
          return f()
        }))
        .then((newResults) => {
          const currentResults = [...newResults, ...results]
          onPartialResult(currentResults)
          iter(currentResults, remainingThunks.slice(1))
        })
        .catch((error) => {
          log.error('Failed to execute a sequenced promise', error.message, error)
        })
    }

    iter([], thunks)
  })
}

/**
 * auth, database and storage should be thunks that produce instances
 * of the correspending firebase objects from either the firebase JS
 * api or the react-native-firebase api.
 */
const api = (auth, database, storage, baseAPIDomain, development, log, isDesktop) => {
  const BASE_API_URL =
    (!isDesktop && development) || !baseAPIDomain ? '' : `https://${baseAPIDomain || ''}`

  const sequence = sequencePromiseThunks(log)

  const defaultErrorHandler = (error) => {
    log.error('Error communicating with Firebase.', error.message, error)
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

  const updateAuthFileName = (fileId, newName) => {
    return axios
      .post(`${BASE_API_URL}/api/update-auth-name`, {
        fileId,
        newName,
      })
      .then((response) => ({
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

  const editFileName = (fileId, newName) => {
    const { doc, updateDoc } = database()
    return updateDoc(doc(`file/${fileId}`), {
      fileName: newName,
    }).then(() => {
      return updateAuthFileName(fileId, newName)
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
      case 'attributes':
        return actions.attributes
    }
    return null
  }

  const handleSnapshot = (
    withAction,
    fileId,
    path,
    withData,
    patching,
    clientId,
    loadFunctionKey = 'load',
    usingFromDocRef = () => ({})
  ) => {
    return {
      next: (documentRef) => {
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
      },
      error: (error) => {
        log.error(
          `Error listening to ${fileId} at ${path} with a loadFunctionKey of ${loadFunctionKey}`,
          error.message
        )
      },
    }
  }

  const listenToFile = (
    userId,
    fileId,
    clientId,
    withAction,
    errorHandler = defaultErrorHandler
  ) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId, path: `plottr://${fileId}` })
    const { doc, onSnapshot } = database()
    return onSnapshot(
      doc(`file/${fileId}`),
      handleSnapshot(withAction, fileId, 'file', withIsCloud, true, clientId, 'patchFile', (x) => ({
        id: x.id,
      }))
    )
  }

  const listenForObjectAtPath =
    (path) =>
    (userId, fileId, clientId, withAction, errorHandler = defaultErrorHandler) => {
      const identity = (x) => x
      const { doc, onSnapshot } = database()
      return onSnapshot(
        doc(`${path}/${fileId}`),
        handleSnapshot(withAction, fileId, path, identity, true, clientId)
      )
    }

  const listenForArrayAtPath =
    (path) =>
    (userId, fileId, clientId, withAction, errorHandler = defaultErrorHandler) => {
      const values = (x) => Object.values(x)
      const { doc, onSnapshot } = database()
      return onSnapshot(
        doc(`${path}/${fileId}`),
        handleSnapshot(withAction, fileId, path, values, true, clientId)
      )
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
    const { doc, onSnapshot } = database()
    return onSnapshot(
      doc(`beats/${fileId}`),
      handleSnapshot(withAction, fileId, 'beats', transform, true, clientId)
    )
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
  const listenToAttributes = listenForObjectAtPath('attributes')

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
    const { doc, getDoc } = database()
    return getDoc(doc(`${path}/${fileId}`)).then(onFetched(fileId, path, values, clientId))
  }

  const fetchObjectAtPath = (path) => (userId, fileId, clientId) => {
    const identity = (x) => x
    const { doc, getDoc } = database()
    return getDoc(doc(`${path}/${fileId}`)).then(onFetched(fileId, path, identity, clientId))
  }

  const fetchBeats = (userId, fileId, clientId, version) => {
    const transform = semverGt(version, WHEN_BEATS_BECAME_AN_OBJECT)
      ? (x) => x
      : (x) => Object.values(x)
    const { doc, getDoc } = database()
    return getDoc(doc(`beats/${fileId}`)).then(onFetched(fileId, 'beats', transform, clientId))
  }

  const fetchFile = (userId, fileId, clientId) => {
    const withIsCloud = (x) => ({ ...x, isCloudFile: true, id: fileId })
    const path = 'file'
    const { doc, getDoc } = database()
    return getDoc(doc(`authorisation/${userId}/granted/${fileId}`)).then((authorisationRef) => {
      const withAuthorisation = (x) => withIsCloud({ ...x, ...authorisationRef.data() })
      return getDoc(doc(`${path}/${fileId}`)).then(
        onFetched(fileId, path, withAuthorisation, clientId)
      )
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
  const fetchAttributes = fetchObjectAtPath('attributes')

  const toFirestoreArray = (array) =>
    array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

  const overwriteAllKeys = (fileId, clientId, state) => {
    const requests = []
    Object.keys(state).forEach((key) => {
      if (SYSTEM_REDUCER_KEYS.indexOf(key) !== -1) {
        return
      }
      const payload = ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(state[key]) : state[key]
      requests.push(
        overwrite(key, fileId, payload, clientId)
          .catch((error) => {
            log.error(`Error while force updating file ${fileId} at key: ${key}`, error)
            return Promise.reject(error)
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

  const initialFetch = (userId, fileId, clientId) => {
    return fetchFile(userId, fileId, clientId)
      .then((file) => {
        return Promise.all([
          fetchChapters(userId, fileId, clientId),
          fetchBeats(userId, fileId, clientId, file.file.version),
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
          fetchAttributes(userId, fileId, clientId),
        ]).then((results) => {
          return [file, ...results]
        })
      })
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
    const setDeletedAuthorisation = () => {
      return axios.post(`${BASE_API_URL}/api/delete-auth`, {
        fileId,
      })
    }
    const setDeleted = (path) => patch(path, fileId, { deleted: true }, clientId)
    const setDeletedfile = () => setDeleted('file')
    const setDeletedCards = () => setDeleted('cards')
    const setDeletedSeries = () => setDeleted('series')
    const setDeletedBooks = () => setDeleted('books')
    const setDeletedCategories = () => setDeleted('categories')
    const setDeletedCharacters = () => setDeleted('characters')
    const setDeletedCustomAttributes = () => setDeleted('customAttributes')
    const setDeletedLines = () => setDeleted('lines')
    const setDeletedBeats = () => setDeleted('beats')
    const setDeletedNotes = () => setDeleted('notes')
    const setDeletedPlaces = () => setDeleted('places')
    const setDeletedTags = () => setDeleted('tags')
    const setDeletedHierarchyLevels = () => setDeleted('hierarchyLevels')
    const setDeletedImages = () => setDeleted('images')
    const setDeletedAttributes = () => setDeleted('attributes')

    return setDeletedAuthorisation()
      .then(setDeletedfile)
      .then((deleteFileResult) =>
        pingAuth(userId, fileId).then((pingAuthResult) =>
          Promise.all([
            setDeletedCards(),
            setDeletedSeries(),
            setDeletedBooks(),
            setDeletedCategories(),
            setDeletedCharacters(),
            setDeletedCustomAttributes(),
            setDeletedLines(),
            setDeletedBeats(),
            setDeletedNotes(),
            setDeletedPlaces(),
            setDeletedTags(),
            setDeletedHierarchyLevels(),
            setDeletedImages(),
            setDeletedAttributes(),
          ]).then((results) => [pingAuthResult, deleteFileResult, ...results])
        )
      )
  }

  const listenToFiles = (userId, callback, errorHandler = defaultErrorHandler) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`authorisation/${userId}/granted`), {
      next: (authorisationsRef) => {
        const authorisedDocuments = []
        authorisationsRef.forEach((authorisation) => {
          const data = authorisation.data()
          if (data.deleted) return

          authorisedDocuments.push({
            id: authorisation.id,
            ...data,
            fileURL: `plottr://${authorisation.id}`,
            isCloudFile: true,
          })
        })
        callback(authorisedDocuments)
      },
      error: (error) => {
        log.error('Error listening to files', error.message, error)
        errorHandler(error)
      },
    })
  }

  const fetchFiles = (userId) => {
    const { collection, getDocs } = database()

    return getDocs(collection(`authorisation/${userId}/granted`)).then((authorisationsRef) => {
      const authorisedDocuments = []
      authorisationsRef.forEach((authorisation) => {
        const data = authorisation.data()
        if (data.deleted) return

        authorisedDocuments.push({
          id: authorisation.id,
          ...data,
          fileURL: `plottr://${authorisation.id}`,
          isCloudFile: true,
        })
      })
      return authorisedDocuments
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
      .then((response) => {
        if (response.ok) {
          return response
        }
        return response.text().then((body) => {
          return Promise.reject(
            new Error(`HTTP failure while minting a cookie: ${response.status}.  Body: ${body}`)
          )
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
    return auth().currentUser()
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
    const { doc, updateDoc } = database()
    return updateDoc(doc(`${path}/${fileId}`), {
      ...payload,
      clientId,
      fileId,
    })
  }

  const overwrite = (path, fileId, payload, clientId) => {
    const { doc, setDoc } = database()
    return setDoc(doc(`${path}/${fileId}`), {
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
        const { getDoc, doc, setDoc } = database()
        return getDoc(doc(`file/${fileId}`)).then((documentRef) => {
          const document = documentRef && documentRef.data()
          const shareRecords = document.shareRecords || []
          const existingShareRecord = shareRecords.find(
            (shareRecord) => shareRecord.emailAddress === emailAddress
          )
          if (existingShareRecord) {
            return pingAuth(userId, fileId)
          }
          return setDoc(
            doc(`file/${fileId}`),
            {
              shareRecords: [...shareRecords, { emailAddress, permission }],
            },
            { merge: true }
          ).then(() => {
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
    const { doc, getDoc, runTransaction } = database()
    const lockReference = doc(`rce/${fileId}/editors/${editorId}/locks/current`)
    return runTransaction((transactions) => {
      return transactions.get(lockReference).then((lock) => {
        if (!lock.exists) {
          return Promise.reject(`Lock for file: ${fileId}, and editor: ${editorId} doesn't exist!`)
        }
        if (isEqual(lock.data(), expectedLock)) {
          return transactions.update(lockReference, { clientId: null })
        }
        return Promise.resolve('Lock modified by another client or request')
      })
    }).then(() => {
      return getDoc(doc(`rce/${fileId}/editors/${editorId}/locks/current`)).then((ref) => {
        return ref.data()
      })
    })
  }

  const lockRCE = (fileId, editorId, clientId, expectedLock, emailAddress = '') => {
    const { doc, getDoc, runTransaction } = database()
    return runTransaction((transactions) => {
      const lockReference = doc(`rce/${fileId}/editors/${editorId}/locks/current`)
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
        return getDoc(doc(`rce/${fileId}/editors/${editorId}/locks/current`)).then((ref) =>
          ref.data()
        )
      })
      .catch((error) => {
        log.error(
          `Error acquiring the RCE lock for rce/${fileId}/editors/${editorId}/locks/current`,
          error.message
        )
        return Promise.reject(error)
      })
  }

  const listenForRCELock = (fileId, editorId, clientId, cb) => {
    const { doc, onSnapshot } = database()
    return onSnapshot(doc(`rce/${fileId}/editors/${editorId}/locks/current`), {
      next: (documentRef) => {
        const data = documentRef && documentRef.data()
        if (!data) {
          cb({ clientId: null })
          return
        }
        cb(data)
      },
      error: (error) => {
        log.error(`Error listening for a lock on ${clientId}/${fileId}/${editorId}`, error.message)
      },
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
    const { where, getDocs, query, collection } = database()
    return getDocs(
      query(
        collection(`backup/${userId}/files`),
        where('fileId', '==', fileId),
        where('backupTime', '==', startOfToday),
        where('startOfSession', '==', true)
      )
    ).then(getSingleDocument)
  }

  const currentBackup = (userId, file, startOfToday, fileId) => {
    const { where, getDocs, query, collection } = database()
    return getDocs(
      query(
        collection(`backup/${userId}/files`),
        where('fileId', '==', fileId),
        where('backupTime', '==', startOfToday),
        where('startOfSession', '==', false)
      )
    ).then(getSingleDocument)
  }

  const TEN_SECONDS_IN_MILISECONDS = 10000

  const saveBackup = (userId, fullFile) => {
    const startOfToday = DateTime.now().startOf('day').toJSDate()
    const lastModified = new Date()
    const fileId = selectors.fileIdSelector(fullFile)
    const fileName = selectors.fileNameSelector(fullFile)
    const file = removeSystemKeys(fullFile)

    return startOfSessionBackup(userId, file, startOfToday, fileId)
      .then((startOfSession) => {
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
                const { doc, updateDoc } = database()
                return updateDoc(doc(`backup/${userId}/files/${documentRef.id}`), {
                  ...document,
                  fileName,
                  storagePath: path,
                  lastModified: new Date(),
                })
              })
            }
            // Add a non-start-of-session backup.
            return backupToStorage(userId, file, startOfToday, false).then((path) => {
              const { addDoc, collection } = database()
              return addDoc(collection(`backup/${userId}/files`), {
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
          const { addDoc, collection } = database()
          return addDoc(collection(`backup/${userId}/files`), {
            backupTime: startOfToday,
            fileId,
            storagePath: path,
            fileName,
            startOfSession: true,
            lastModified: new Date(),
          })
        })
      })
      .then(() => {
        return true
      })
  }

  const listenForBackups = (userId, onBackupsChanged) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`backup/${userId}/files`), {
      next: (documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        onBackupsChanged(documents)
      },
      error: (error) => {
        log.error(`Error listening for backups for ${userId}`, error.message)
      },
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

  const saveFileToStorage = (userId, storageURL, fileText) => {
    return axios
      .post(`${BASE_API_URL}/api/save-file-to-storage`, {
        userId,
        fileText,
        storageURL,
      })
      .then((response) => {
        return response.data.storageURL
      })
      .catch((error) => {
        log.error(`Failed to upload file for user ${userId} to ${storageURL}`, error)
        return Promise.reject(error)
      })
  }

  const backupToStorage = (userId, file, date, startOfSession) => {
    const fileId = selectors.fileIdSelector(file)
    const storageURL = toBackupPath(userId, fileId, date, startOfSession)
    return saveFileToStorage(userId, storageURL, JSON.stringify(file))
  }

  const toTemplatePath = (userId, templateId) => {
    return `storage://userTemplates/${userId}/${templateId}`
  }

  const saveCustomTemplate = (userId, template) => {
    const storageURL = toTemplatePath(userId, template.id)
    return saveFileToStorage(userId, storageURL, JSON.stringify(template)).then(() => {
      // Bumping the timestamp will guarantee that listeners fetch
      // the latest versions.
      const { doc, setDoc } = database()
      return setDoc(doc(`templates/${userId}/userTemplates/${template.id}`), {
        id: template.id,
        path: storageURL,
        timeStamp: new Date(),
      })
    })
  }

  const templatePublicURL = (storageURL) => {
    return axios
      .get(`${BASE_API_URL}/api/template-public-url?url=${storageURL}`)
      .then((response) => {
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error('Error getting template public url', status, error && error.response, error)
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const allTemplateUrlsForUser = (documents) => {
    return Promise.all(
      documents.map(({ path }) => {
        return templatePublicURL(path).catch((error) => {
          log.error(`Failed to get public URL for template at ${path}`)
          return Promise.resolve('IGNORE')
        })
      })
    ).then((urls) => {
      return urls.filter((url) => {
        return url !== 'IGNORE'
      })
    })
  }

  const listenToCustomTemplates = (userId, callback, errorHandler = defaultErrorHandler) => {
    const { collection, onSnapshot } = database()
    return onSnapshot(collection(`templates/${userId}/userTemplates`), {
      next: (documentsRef) => {
        const documents = []
        documentsRef.forEach((document) => {
          documents.push(document.data())
        })
        allTemplateUrlsForUser(documents)
          .then((urls) =>
            Promise.all(
              urls.map((url) =>
                fetch(url).then((response) => {
                  if (response.ok) {
                    return response.json()
                  }

                  return response.text().then((body) => {
                    return Promise.reject(
                      new Error(
                        `HTTP request for custom template failed: ${response.status}.  Body: ${body}`
                      )
                    )
                  })
                })
              )
            )
          )
          .then(callback)
          .catch(errorHandler)
      },
      error: errorHandler,
    })
  }

  const editCustomTemplate = saveCustomTemplate

  const deleteCustomTemplate = (userId, templateId) => {
    const storageURL = `userTemplates/${userId}/${templateId}`
    return axios
      .post(`${BASE_API_URL}/api/delete-custom-template?url=${storageURL}`)
      .then((response) => {
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error('Error getting template public url', status, error && error.response, error)
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
      .then((result) => {
        const { doc, deleteDoc } = database()
        return deleteDoc(doc(`templates/${userId}/userTemplates/${templateId}`))
      })
  }

  const escapeImageName = (imageName) => {
    return imageName.replace(/\//g, '__').replace(/:/g, '--')
  }

  const toImagePath = (userId, imageName) => {
    return `storage://images/${userId}/${escapeImageName(imageName)}`
  }

  const saveImageToStorageBlob = (userId, imageName, imageUrl) => {
    const filePath = toImagePath(userId, imageName)
    return axios
      .post(`${BASE_API_URL}/api/upload-image`, {
        userId,
        imageUrl,
        storageURL: filePath,
      })
      .then((response) => {
        return response.data.storageURL
      })
      .catch((error) => {
        log.error(`Failed to upload image for user ${userId} to ${filePath}`, error)
        return Promise.reject(error)
      })
  }

  const saveImageToStorageFromURL = (userId, imageName, imageUrl) => {
    return saveImageToStorageBlob(userId, imageName, imageUrl)
  }

  const backupPublicURL = (storageProtocolURL) => {
    return axios
      .get(`${BASE_API_URL}/api/backup-public-url?url=${storageProtocolURL}`)
      .then((response) => {
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error('Error getting file public url', status, error && error.response, error)
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const filePublicURL = (storageProtocolURL, fileId, userId) => {
    return axios
      .get(
        `${BASE_API_URL}/api/file-public-url?url=${storageProtocolURL}&fileId=${fileId}&userId=${userId}`
      )
      .then((response) => {
        return response.data.publicURL
      })
      .catch((error) => {
        const status = error && error.response && error.response.status
        log.error('Error getting file public url', status, error && error.response, error)
        if (status === 401) return mintCookieToken(currentUser())
        return Promise.reject(error)
      })
  }

  const imagePublicURL = (storageProtocolURL, fileId, userId) => {
    return filePublicURL(storageProtocolURL, fileId, userId)
  }

  const isStorageURL = (string) => {
    return string.startsWith('storage://')
  }

  const loginWithEmailAndPassword = (userName, password) => {
    return auth().signInWithEmailAndPassword(userName, password)
  }

  return {
    editFileName,
    updateAuthFileName,
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
    listenToAttributes,
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

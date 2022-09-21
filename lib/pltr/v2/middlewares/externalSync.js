import { isEqual } from 'lodash'

import { permissionError } from '../actions/error'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import { fileIdSelector } from '../selectors/file'
import { clientIdSelector } from '../selectors/client'
import { isCloudFileSelector, isOfflineSelector, isResumingSelector } from '../selectors/project'

// Synchronise with Firebase.  Produce true if we actually synchronised.
const sync = (previous, present, patch, withData, store, action) => {
  const isCloudFile = isCloudFileSelector(present)
  const isOffline = isOfflineSelector(present)
  const isResuming = isResumingSelector(present)
  const fileId = fileIdSelector(present)
  const clientId = clientIdSelector(present)
  const selectedFileId =
    present.project && present.project.selectedFile && present.project.selectedFile.id
  const userPermission =
    present.project && present.project.selectedFile && present.project.selectedFile.permission
  const notPermittedToChangeFile = userPermission !== 'owner' && userPermission !== 'collaborator'

  if (
    notPermittedToChangeFile ||
    action.type === 'FILE_LOADED' ||
    action.type === 'RECORD_LAST_ACTION' ||
    action.type === 'PERMISSION_ERROR' ||
    action.type === 'CLEAR_ERROR' ||
    action.patching ||
    !isCloudFile ||
    isOffline ||
    isResuming ||
    !fileId ||
    !clientId ||
    selectedFileId !== fileId
  ) {
    return false
  }

  // It's possible that nothing undoable happened yet.
  if (!previous) return false

  Object.keys(present).forEach((key) => {
    // Preconditions for syncing
    if (SYSTEM_REDUCER_KEYS.indexOf(key) > -1) return
    if (key === 'ui') return
    // Also don't sync file record changes unless we're the owner
    if (key === 'file' && userPermission !== 'owner') {
      return
    }
    if (!isEqual(previous[key], present[key])) {
      const payload = withData(key, present[key])
      patch(key, fileId, payload, clientId).catch((error) => {
        if (error.code === 'permission-denied') {
          store.dispatch(permissionError(key, action, error.code))
        }
      })
    }
  })

  return true
}

const externalSync = (patch, withData) => (store) => (next) => (action) => {
  const result = next(action)

  const { future, present, past } = store.getState()
  const previous = action.type === '@@redux-undo/UNDO' ? future[0] : past[past.length - 1]
  sync(previous, present, patch, withData, store, action)

  return result
}

export default externalSync

let previous = null
export const externalSyncWithoutHistory = (patch, withData) => (store) => (next) => (action) => {
  const result = next(action)
  const present = store.getState()

  const synchronised = sync(previous, present, patch, withData, store, action)
  if (synchronised) {
    previous = present
  }

  return result
}

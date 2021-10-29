import { isEqual } from 'lodash'
import { ARRAY_KEYS } from './array-keys'

import { permissionError } from '../actions/error'

const externalSync = (patch, withData) => (store) => (next) => (action) => {
  const result = next(action)

  const { future, present, past } = store.getState()
  if (!present?.file?.isCloudFile) return result

  const fileId = present.file.id
  const clientId = present.client.clientId
  if (fileId) {
    const previous = action.type === '@@redux-undo/UNDO' ? future[0] : past[past.length - 1]
    Object.keys(present).forEach((key) => {
      if (
        action.type === 'RECORD_LAST_ACTION' ||
        action.type === 'PERMISSION_ERROR' ||
        action.type === 'CLEAR_ERROR' ||
        key === 'error' ||
        key === 'permission' ||
        key === 'ui' ||
        key === 'project' ||
        key === 'editors' ||
        key === 'actions'
      )
        return
      if (
        key === 'file' &&
        present.project.selectedFile &&
        present.project.selectedFile.permision !== 'owner'
      ) {
        return
      }
      if (present.project.selectedFile.id !== present.file.id) {
        return
      }
      if (action.patching || action.type === 'FILE_LOADED') return
      if (!isEqual(previous[key], present[key])) {
        const payload = withData(key, present[key])
        patch(key, fileId, payload, clientId).catch((error) => {
          if (error.code === 'permission-denied') {
            store.dispatch(permissionError(key, action, error.code))
          }
        })
      }
    })
  }

  return result
}

export default externalSync

let previous = null

export const externalSyncWithoutHistory = (patch, withData) => (store) => (next) => (action) => {
  const result = next(action)
  const present = store.getState()

  if (!present?.file?.isCloudFile) return result

  const fileId = present.file && present.file.id
  const clientId = present.client && present.client.clientId
  if (fileId && previous) {
    Object.keys(present).forEach((key) => {
      if (
        action.type === 'RECORD_LAST_ACTION' ||
        action.type === 'PERMISSION_ERROR' ||
        action.type === 'CLEAR_ERROR' ||
        key === 'error' ||
        key === 'permission' ||
        key === 'ui' ||
        key === 'project' ||
        key === 'editors' ||
        key === 'actions'
      )
        return
      if (
        key === 'file' &&
        present.project.selectedFile &&
        present.project.selectedFile.permision !== 'owner'
      ) {
        return
      }
      if (present.project.selectedFile.id !== present.file.id) {
        return
      }
      if (action.patching || action.type === 'FILE_LOADED') return
      if (!isEqual(previous[key], present[key])) {
        const payload = withData(key, present[key])
        patch(key, fileId, payload, clientId).catch((error) => {
          if (error.code === 'permission-denied') {
            store.dispatch(permissionError(key, action, error.code))
          }
        })
      }
    })
  }

  previous = present

  return result
}

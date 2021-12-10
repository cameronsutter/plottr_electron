import { v4 as uuidv4 } from 'uuid'

import {
  FILE_LOADED,
  FILE_SAVED,
  NEW_FILE,
  RESET,
  EDIT_FILENAME,
  LOAD_FILE,
  SET_FILE_NAME,
  RESTORE_FILE_NAME,
  SET_OFFLINE,
  SET_RESUMING,
  RECORD_LAST_ACTION,
} from '../constants/ActionTypes'
import { file as defaultFile } from '../store/initialState'
import { SYSTEM_REDUCER_ACTION_TYPES } from './systemReducers'

const file =
  (dataRepairers) =>
  (stateWithoutTimeStamp = defaultFile, action) => {
    const shouldUpdateTimestamp =
      !stateWithoutTimeStamp.versionStamp ||
      !stateWithoutTimeStamp.timeStamp ||
      (action.type !== SET_FILE_NAME &&
        action.type !== RESTORE_FILE_NAME &&
        SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) === -1 &&
        !stateWithoutTimeStamp.isResuming)
    const state = {
      ...stateWithoutTimeStamp,
      timeStamp: shouldUpdateTimestamp ? new Date() : stateWithoutTimeStamp.timeStamp,
      versionStamp: shouldUpdateTimestamp ? uuidv4() : stateWithoutTimeStamp.versionStamp,
    }
    switch (action.type) {
      case FILE_LOADED:
        return {
          fileName: action.fileName,
          loaded: true,
          dirty: action.dirty,
          version: action.version,
          id: action.data.file.id || null,
          appliedMigrations: action.data.file.appliedMigrations || [],
          initialVersion: action.data.file.initialVersion || action.version,
          isCloudFile: action.data.file.isCloudFile || false,
        }

      case FILE_SAVED:
        return Object.assign({}, state, { dirty: false })

      case NEW_FILE:
        return { fileName: action.fileName, loaded: true, dirty: false, version: action.version }

      case EDIT_FILENAME:
        return Object.assign({}, state, { fileName: action.newName })

      case RESET:
        return Object.assign({}, action.data.file, { dirty: true })

      case LOAD_FILE:
        return action.file

      case SET_FILE_NAME:
        if (state.originalFileName) return state
        return {
          ...state,
          originalFileName: state.fileName,
          fileName: action.newFileName,
        }

      case RESTORE_FILE_NAME:
        if (!state.originalFileName) return state
        return {
          ...state,
          originalFileName: null,
          // There's no originalFileName when we boot the app
          fileName: state.originalFileName,
        }

      // We duplicate the resuming state from project here because
      // it's critical that we don't change timestamps while we resume
      // and it's possible for other actions to fire in between
      // setting offline and setting resume.
      case SET_OFFLINE:
        if (action.isOffline) {
          return {
            ...stateWithoutTimeStamp,
            resuming: false,
            originalVersionStamp: stateWithoutTimeStamp.versionStamp,
            originalTimeStamp: stateWithoutTimeStamp.timeStamp,
          }
        } else {
          return {
            ...state,
            resuming: true,
          }
        }

      case SET_RESUMING:
        return {
          ...stateWithoutTimeStamp,
          resuming: action.resuming,
        }

      default:
        return Object.assign({}, state, { dirty: true })
    }
  }

export default file

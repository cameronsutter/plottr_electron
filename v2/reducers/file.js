import { v4 as uuidv4 } from 'uuid'

import {
  FILE_LOADED,
  FILE_SAVED,
  NEW_FILE,
  RESET,
  EDIT_FILENAME,
  LOAD_FILE,
  SET_OFFLINE,
  SET_RESUMING,
  RECORD_LAST_ACTION,
  SELECT_FILE,
} from '../constants/ActionTypes'
import { file as defaultFile } from '../store/initialState'
import { SYSTEM_REDUCER_ACTION_TYPES } from './systemReducers'
import LoadActions from '../constants/loadActions'

const file =
  (dataRepairers) =>
  (stateWithoutTimeStamp = defaultFile, action) => {
    const shouldNotUpdateTimestamp =
      action.type.startsWith('@') ||
      action.type === 'FILE_LOADED' ||
      LoadActions.indexOf(action.type) !== -1 ||
      SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) !== -1 ||
      stateWithoutTimeStamp.isResuming
    const state = stateWithoutTimeStamp && {
      ...stateWithoutTimeStamp,
      timeStamp: shouldNotUpdateTimestamp ? stateWithoutTimeStamp.timeStamp : new Date(),
      versionStamp: shouldNotUpdateTimestamp ? stateWithoutTimeStamp.versionStamp : uuidv4(),
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

      case SELECT_FILE: {
        return action.selectedFile
      }

      default:
        return Object.assign({}, state, { dirty: true })
    }
  }

export default file

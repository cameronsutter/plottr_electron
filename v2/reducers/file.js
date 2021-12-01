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
} from '../constants/ActionTypes'
import { file as defaultFile } from '../store/initialState'

const file =
  (dataRepairers) =>
  (stateWithoutTimeStamp = defaultFile, action) => {
    const state = {
      ...stateWithoutTimeStamp,
      timeStamp: new Date(),
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

      case SET_OFFLINE:
        if (action.isOffline) {
          return {
            ...state,
            timeStamp: stateWithoutTimeStamp.timeStamp || state.timeStamp,
            originalTimeStamp: stateWithoutTimeStamp.timeStamp || state.timeStamp,
          }
        } else return state

      default:
        return Object.assign({}, state, { dirty: true })
    }
  }

export default file

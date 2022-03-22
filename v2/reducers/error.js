import {
  CLEAR_ERROR,
  PERMISSION_ERROR,
  GENERAL_ERROR,
  IMPORT_ERROR,
  SAVE_TEMP_FILE_ERROR,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  error: null,
  storeKey: null,
  action: null,
}

const errorReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case PERMISSION_ERROR: {
        return {
          error: action.error,
          action: action.action,
          storeKey: action.storeKey,
        }
      }

      case GENERAL_ERROR:
        return {
          error: action.error,
        }

      case CLEAR_ERROR:
        return INITIAL_STATE

      case IMPORT_ERROR:
        return {
          error: action.error,
        }

      case SAVE_TEMP_FILE_ERROR: {
        return {
          error: action.error,
        }
      }

      default:
        return state
    }
  }

export default errorReducer

import { CLEAR_ERROR, PERMISSION_ERROR } from '../constants/ActionTypes'

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

      case CLEAR_ERROR:
        return INITIAL_STATE

      default:
        return state
    }
  }

export default errorReducer

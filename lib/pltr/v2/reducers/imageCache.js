import { CACHE_IMAGE } from '../constants/ActionTypes'

const INITIAL_STATE = {}

const imageCacheReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CACHE_IMAGE: {
      return {
        ...state,
        [action.storageUrl]: {
          publicUrl: action.publicUrl,
          timestamp: action.timestamp,
        },
      }
    }
    default: {
      return state
    }
  }
}

export default imageCacheReducer

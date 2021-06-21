import {
  FILE_LOADED,
  NEW_FILE,
  RESET,
  SET_FEATURE_FLAG,
  UNSET_FEATURE_FLAG,
} from '../constants/ActionTypes'
import { featureFlags } from '../store/initialState'

const INITIAL_STATE = featureFlags

const featureFlagsReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SET_FEATURE_FLAG:
        return {
          ...state,
          [action.flagName]: true,
        }
      case UNSET_FEATURE_FLAG:
        return {
          ...state,
          [action.flagName]: false,
        }

      case RESET:
      case FILE_LOADED:
        return action.data.featureFlags || INITIAL_STATE

      case NEW_FILE:
        return INITIAL_STATE

      default:
        return state
    }
  }

export default featureFlagsReducer

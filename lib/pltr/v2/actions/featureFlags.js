import { SET_FEATURE_FLAG, UNSET_FEATURE_FLAG } from '../constants/ActionTypes'

export const setFeatureFlag = (flagName) => ({
  type: SET_FEATURE_FLAG,
  flagName,
})

export const unsetFeatureFlag = (flagName) => ({
  type: UNSET_FEATURE_FLAG,
  flagName,
})

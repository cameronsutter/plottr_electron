import { LOAD_FEATURE_FLAGS, SET_FEATURE_FLAG, UNSET_FEATURE_FLAG } from '../constants/ActionTypes'

// Leaving in case we add another feature flag in due course.
// eslint-disable-next-line no-unused-vars
const setFeatureFlag = (flagName) => ({
  type: SET_FEATURE_FLAG,
  flagName,
})

// Leaving in case we add another feature flag in due course.
// eslint-disable-next-line no-unused-vars
const unsetFeatureFlag = (flagName) => ({
  type: UNSET_FEATURE_FLAG,
  flagName,
})

export const load = (patching, featureFlags) => ({
  type: LOAD_FEATURE_FLAGS,
  patching,
  featureFlags,
})

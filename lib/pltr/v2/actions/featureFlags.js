import { LOAD_FEATURE_FLAGS, SET_FEATURE_FLAG, UNSET_FEATURE_FLAG } from '../constants/ActionTypes'
import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

const setFeatureFlag = (flagName) => ({
  type: SET_FEATURE_FLAG,
  flagName,
})

const unsetFeatureFlag = (flagName) => ({
  type: UNSET_FEATURE_FLAG,
  flagName,
})

export const setBeatHierarchy = () => setFeatureFlag(BEAT_HIERARCHY_FLAG)

export const unsetBeatHierarchy = () => unsetFeatureFlag(BEAT_HIERARCHY_FLAG)

export const loadFeatureFlags = (patching, featureFlags) => ({
  type: LOAD_FEATURE_FLAGS,
  patching,
  featureFlags,
})

import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

const gatedBy = (featureFlagName) => (featureFlags) => (thunk) => {
  if (featureFlags[featureFlagName]) {
    return thunk()
  }
  return null
}

export const gatedByBeatHierarchy = gatedBy(BEAT_HIERARCHY_FLAG)

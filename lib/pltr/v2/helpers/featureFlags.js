import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

// eslint-disable-next-line react/display-name
const gatedBy = (featureFlagName) => (featureFlags) => (thunk) => {
  if (featureFlags[featureFlagName]) {
    return thunk()
  }
  return null
}

export const gatedByBeatHierarchy = gatedBy(BEAT_HIERARCHY_FLAG)

export const beatHierarchyIsOn = (featureFlags) => featureFlags[BEAT_HIERARCHY_FLAG]

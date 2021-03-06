import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

export const beatsHierarchyIsOn = (state) => state.featureFlags[BEAT_HIERARCHY_FLAG]

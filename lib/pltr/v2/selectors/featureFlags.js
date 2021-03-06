import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

export const beatHierarchyIsOn = (state) => state.featureFlags[BEAT_HIERARCHY_FLAG]

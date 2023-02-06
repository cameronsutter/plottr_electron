// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'

export const beatHierarchyIsOn = (state) => state.featureFlags[BEAT_HIERARCHY_FLAG]

export const featureFlags = (state) => state.featureFlags

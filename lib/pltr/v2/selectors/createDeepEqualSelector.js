import { createSelectorCreator, defaultMemoize } from 'reselect'
import { isEqual } from 'lodash'

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

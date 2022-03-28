import { createSelector } from 'reselect'

import { previouslyLoggedIntoProSelector } from './settings'
import { isOnWebSelector } from './client'

export const shouldBeInProSelector = createSelector(
  previouslyLoggedIntoProSelector,
  isOnWebSelector,
  (previouslyLoggedIntoPro, isOnWeb) => {
    return !!(previouslyLoggedIntoPro || isOnWeb)
  }
)

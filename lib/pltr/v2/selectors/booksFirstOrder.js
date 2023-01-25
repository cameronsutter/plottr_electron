// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

export const allBookIdsSelector = (state) => state.books.allIds
export const allBooksSelector = (state) => state.books

export const canDeleteBookSelector = createSelector(
  allBookIdsSelector,
  (bookIds) => bookIds.length > 1
)

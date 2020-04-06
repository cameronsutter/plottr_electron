import { createSelector } from 'reselect'

export const allBookIdsSelector = state => state.books.allIds

export const canDeleteBookSelector = createSelector(
  allBookIdsSelector,
  (bookIds) => bookIds.length > 1
)
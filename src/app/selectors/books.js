import { createSelector } from 'reselect'

export const allBookIdsSelector = state => state.books.allIds
export const allBooksSelector = state => state.books
export const currentTimelineSelector = state => state.ui.currentTimeline

export const canDeleteBookSelector = createSelector(
  allBookIdsSelector,
  (bookIds) => bookIds.length > 1
)

export const bookTimelineTemplatesSelector = createSelector(
  allBooksSelector,
  currentTimelineSelector,
  (books, bookId) => {
    if (bookId == 'series') return []

    return books[bookId].timelineTemplates
  }
)

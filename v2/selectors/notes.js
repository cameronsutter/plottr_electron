import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { isSeries } from '../helpers/books'

export const allNotesSelector = (state) => state.notes

export const allNotesInBookSelector = createSelector(
  allNotesSelector,
  currentTimelineSelector,
  (notes, bookId) =>
    notes.filter((note) => {
      if (note.bookIds.length === 0) return true
      if (note.bookIds.some(isSeries)) return true
      return note.bookIds.includes(bookId)
    })
)

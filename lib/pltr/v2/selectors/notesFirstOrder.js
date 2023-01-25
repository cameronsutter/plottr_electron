// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { groupBy } from 'lodash'

export const allNotesSelector = (state) => state.notes

const selectId = (state, id) => id

export const singleNoteSelector = createSelector(allNotesSelector, selectId, (notes, propId) =>
  notes.find((n) => n.id == propId)
)

export const notesByCategorySelector = createSelector(allNotesSelector, (notes) => {
  const grouped = groupBy(notes, 'categoryId')
  if (grouped[undefined] !== undefined) {
    grouped[null] = grouped[undefined].concat(grouped[null] || [])
    delete grouped[undefined]
  }
  return grouped
})

export const stringifiedNotesByIdSelector = createSelector(allNotesSelector, (notes) => {
  return notes.reduce((acc, note) => {
    return {
      ...acc,
      [note.id]: JSON.stringify(note).toLowerCase(),
    }
  }, {})
})

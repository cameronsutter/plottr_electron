import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

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

export function sortEachCategory(visibleByCategory, sort) {
  const sortOperands = sort.split('~')
  const attrName = sortOperands[0]
  const attrExtractor = attrName === 'last edited' ? 'lastEdited' : attrName
  const direction = sortOperands[1]
  const sortByOperand = attrName === 'name' ? [attrExtractor, 'id'] : [attrExtractor, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    const notes = visibleByCategory[k]

    const sorted = sortBy(notes, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

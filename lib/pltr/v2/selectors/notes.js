import { createSelector } from 'reselect'
import { currentTimelineSelector, noteFilterSelector, noteSortSelector } from './ui'
import { isSeries } from '../helpers/books'
import { sortBy, groupBy } from 'lodash'

export const allNotesSelector = (state) => state.notes
const noteCustomAttributesSelector = (state) => state.customAttributes.notes

const selectId = (state, id) => id

export const singleNoteSelector = createSelector(allNotesSelector, selectId, (notes, propId) =>
  notes.find((n) => n.id == propId)
)

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

export const notesByCategorySelector = createSelector(allNotesInBookSelector, (notes) => {
  const grouped = groupBy(notes, 'categoryId')
  if (grouped[undefined] !== undefined) {
    grouped[null] = grouped[undefined]
    delete grouped[undefined]
  }
  return grouped
})

export const noteFilterIsEmptySelector = createSelector(
  noteFilterSelector,
  noteCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, { name: 'character' }, { name: 'place' }, ...attributes]
    return !allAttributes.some((attr) => filter.filter[attr.name] && filter.filter[attr.name].length)
  }
)

export const visibleSortedNotesByCategorySelector = createSelector(
  allNotesSelector,
  notesByCategorySelector,
  noteFilterSelector,
  noteFilterIsEmptySelector,
  noteSortSelector,
  (allNotes, notesByCategory, filter, filterIsEmpty, sort) => {
    if (!allNotes.length) return {}

    let visible = notesByCategory
    if (!filterIsEmpty) {
      visible = {}
      allNotes.forEach((n) => {
        const matches = Object.keys(filter.filter).some((attr) => {
          return filter.filter[attr].some((val) => {
            if (attr == 'tag' && n.tags.includes(parseInt(val))) {
              return true
            }
            if (attr == 'book' && n.bookIds.includes(parseInt(val))) {
              return true
            }
            if (attr == 'character' && n.characters.includes(parseInt(val))) {
              return true
            }
            if (attr == 'place' && n.places.includes(parseInt(val))) {
              return true
            }
            if (val == '') {
              if (!n[attr] || n[attr] == '') return true
            } 
            return false
          })
        })
        if (matches) {
          if (visible[n.categoryId] && visible[n.categoryId].length) {
            visible[n.categoryId].push(n)
          } else {
            visible[n.categoryId] = [n]
          }
        }
      })
    }
    return sortEachCategory(visible, sort)
  }
)

function sortEachCategory(visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    let notes = visibleByCategory[k]

    let sorted = sortBy(notes, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

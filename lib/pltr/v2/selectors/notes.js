import { createSelector } from 'reselect'
import { currentTimelineSelector, noteFilterSelector, noteSortSelector } from './ui'
import { isSeries } from '../helpers/books'
import { sortBy, groupBy } from 'lodash'

export const allNotesSelector = (state) => state.notes
const noteCustomAttributesSelector = (state) => state.customAttributes.notes

const selectId = (state, id) => id

export const singleNoteSelector = createSelector(
  allNotesSelector,
  selectId,
  (notes, propId) => notes.find((n) => n.id == propId)
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

export const notesByCategorySelector = createSelector(allNotesInBookSelector, (notes) =>
  groupBy(notes, 'categoryId')
)

export const noteFilterIsEmptySelector = createSelector(
  noteFilterSelector,
  noteCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, { name: 'category' }, ...attributes]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
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
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return n.tags.includes(val)
            }
            if (attr == 'book') {
              return n.bookIds.includes(val)
            }
            if (attr == 'category') {
              return n.categoryId == val
            }
            if (val == '') {
              if (!n[attr] || n[attr] == '') return true
            } else {
              if (n[attr] && n[attr] == val) return true
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

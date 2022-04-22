import { createSelector } from 'reselect'
import {
  currentTimelineSelector,
  noteFilterSelector,
  noteSortSelector,
  notesSearchTermSelector,
} from './ui'
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

export const notesByCategorySelector = createSelector(allNotesSelector, (notes) => {
  const grouped = groupBy(notes, 'categoryId')
  if (grouped[undefined] !== undefined) {
    grouped[null] = grouped[undefined].concat(grouped[null] || [])
    delete grouped[undefined]
  }
  return grouped
})

export const noteFilterIsEmptySelector = createSelector(
  noteFilterSelector,
  noteCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [
      { name: 'place' },
      { name: 'tag' },
      { name: 'book' },
      { name: 'noteCategory' },
      { name: 'character' },
      ...attributes,
    ]
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
            if (attr == 'character') {
              return n.characters.includes(val)
            }
            if (attr == 'book') {
              return n.bookIds.includes(val)
            }
            if (attr == 'noteCategory') {
              return n.categoryId == val
            }
            if (attr == 'place') {
              return n.places.includes(val)
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
          const categoryId = n.categoryId === undefined ? null : n.categoryId
          if (visible[categoryId] && visible[categoryId].length) {
            visible[categoryId].push(n)
          } else {
            visible[categoryId] = [n]
          }
        }
      })
      if (visible[undefined] !== undefined) {
        visible[null] = visible[undefined]
        delete visible[undefined]
      }
    }

    return sortEachCategory(visible, sort)
  }
)

export const visibleSortedSearchedNotesByCategorySelector = createSelector(
  visibleSortedNotesByCategorySelector,
  notesSearchTermSelector,
  (noteCategories, searchTerm) => {
    if (!searchTerm) return noteCategories

    const lowSearchTerm = searchTerm.toLowerCase()
    return Object.entries(noteCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ title }) => {
        return title.toLowerCase().match(lowSearchTerm)
      })
      if (newNotes.length > 0) {
        return {
          ...acc,
          [key]: newNotes,
        }
      } else {
        return acc
      }
    }, {})
  }
)

function sortEachCategory(visibleByCategory, sort) {
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

import { createSelector } from 'reselect'

import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { sortEachCategory } from './sortEachCategory'
import { isSeries } from '../helpers/books'

// Other selector dependencies
import {
  allNotesSelector,
  notesByCategorySelector,
  stringifiedNotesByIdSelector,
} from './notesFirstOrder'
import {
  currentTimelineSelector,
  noteFilterIsEmptySelector,
  noteFilterSelector,
  noteSortSelector,
  notesSearchTermSelector,
} from './secondOrder'

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
  stringifiedNotesByIdSelector,
  (noteCategories, searchTerm, stringifiedNotes) => {
    if (!searchTerm) return noteCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(noteCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedNotes[id])
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

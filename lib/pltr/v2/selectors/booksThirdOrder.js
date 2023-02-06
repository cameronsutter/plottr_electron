import { createSelector } from 'reselect'

import { allBooksSelector } from './booksFirstOrder'
import { allCardsSelector } from './cardsFirstOrder'
import { charactersSortedAtoZSelector } from './charactersFirstOrder'
import { allNotesInBookSelector } from './notesThirdOrder'
import { placesSortedAtoZSelector } from './placesFirstOrder'
import { currentViewSelector } from './secondOrder'

export const booksFilterItemsSelector = createSelector(
  currentViewSelector,
  allBooksSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  charactersSortedAtoZSelector,
  allCardsSelector,
  (currentView, books, places, notes, characters, cards) => {
    switch (currentView) {
      case 'notes': {
        const filteredBooks = Object.values(books)
          .filter((book) => {
            return notes.some((character) => {
              return character.bookIds.indexOf(book.id) !== -1
            })
          })
          .reduce((acc, next) => {
            return {
              ...acc,
              [next.id]: next,
            }
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'places': {
        const filteredBooks = Object.values(books)
          .filter((book) => {
            return places.some((character) => {
              return character.bookIds.indexOf(book.id) !== -1
            })
          })
          .reduce((acc, next) => {
            return {
              ...acc,
              [next.id]: next,
            }
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'characters': {
        const filteredBooks = Object.values(books)
          .filter((book) => {
            return characters.some((character) => {
              return character.bookIds.indexOf(book.id) !== -1
            })
          })
          .reduce((acc, next) => {
            return {
              ...acc,
              [next.id]: next,
            }
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'timeline': {
        const filteredBooks = Object.values(books)
          .filter((book) => {
            return cards.some((character) => {
              return character.bookIds.indexOf(book.id) !== -1
            })
          })
          .reduce((acc, next) => {
            return {
              ...acc,
              [next.id]: next,
            }
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      default:
        return {}
    }
  }
)

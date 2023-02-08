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
    const series = { series: { id: 'series', title: 'Series' } }
    const allBooksWithSeries = Object.assign({}, series, books)
    switch (currentView) {
      case 'notes': {
        const filteredBooks = Object.values(allBooksWithSeries)
          .filter((book) => {
            return notes.some((note) => {
              return note?.bookIds.indexOf(book?.id) !== -1
            })
          })
          .reduce((acc, next) => {
            if (next.id) {
              return {
                ...acc,
                [next.id]: next,
              }
            }
            return acc
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'places': {
        const filteredBooks = Object.values(allBooksWithSeries)
          .filter((book) => {
            return places.some((place) => {
              return place?.bookIds?.indexOf(book?.id) !== -1
            })
          })
          .reduce((acc, next) => {
            if (next.id) {
              return {
                ...acc,
                [next.id]: next,
              }
            }
            return acc
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'characters': {
        const filteredBooks = Object.values(allBooksWithSeries)
          .filter((book) => {
            return characters.some((character) => {
              return character?.bookIds?.indexOf(book?.id) !== -1
            })
          })
          .reduce((acc, next) => {
            if (next.id) {
              return {
                ...acc,
                [next.id]: next,
              }
            }
            return acc
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      case 'timeline': {
        const filteredBooks = Object.values(allBooksWithSeries)
          .filter((book) => {
            return cards.some((card) => {
              return card?.bookIds?.indexOf(book?.id) !== -1
            })
          })
          .reduce((acc, next) => {
            if (next.id) {
              return {
                ...acc,
                [next.id]: next,
              }
            }
            return acc
          }, {})

        const allIds = Object.keys(filteredBooks)
        return Object.assign({}, { ...filteredBooks, allIds })
      }
      default:
        return {}
    }
  }
)

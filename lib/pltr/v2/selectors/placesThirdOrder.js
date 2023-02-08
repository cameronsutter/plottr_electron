import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { isSeries } from '../helpers/books'
import { sortEachCategory } from './sortEachCategory'
import { noEntityHasLegacyAttributeBound } from './noEntitiyHasValueBound'
import { placeCustomAttributesSelector } from './customAttributesFirstOrder'

// Other selector dependencies
import {
  allPlacesSelector,
  placesByCategorySelector,
  placesSortedAtoZSelector,
  stringifiedPlacesByIdSelector,
} from './placesFirstOrder'
import {
  currentTimelineSelector,
  currentViewSelector,
  placeFilterIsEmptySelector,
  placeFilterSelector,
  placeSortSelector,
  placesSearchTermSelector,
} from './secondOrder'
import { allNotesInBookSelector } from './notesThirdOrder'
import { allCardsSelector } from './cardsFirstOrder'

export const visibleSortedPlacesByCategorySelector = createSelector(
  allPlacesSelector,
  placesByCategorySelector,
  placeFilterSelector,
  placeFilterIsEmptySelector,
  placeSortSelector,
  (allPlaces, placesByCategory, filter, filterIsEmpty, sort) => {
    if (!allPlaces.length) return {}

    let visible = placesByCategory
    if (!filterIsEmpty) {
      visible = {}
      allPlaces.forEach((ch) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return ch.tags.includes(val)
            }
            if (attr == 'book') {
              return ch.bookIds.includes(val)
            }
            if (attr == 'category') {
              return ch.categoryId == val
            }
            if (val == '') {
              if (!ch[attr] || ch[attr] == '') return true
            } else {
              if (ch[attr] && ch[attr] == val) return true
            }
            return false
          })
        })
        if (matches) {
          if (visible[ch.categoryId] && visible[ch.categoryId].length) {
            visible[ch.categoryId].push(ch)
          } else {
            visible[ch.categoryId] = [ch]
          }
        }
      })
    }

    return sortEachCategory(visible, sort)
  }
)

export const visibleSortedSearchedPlacesByCategorySelector = createSelector(
  visibleSortedPlacesByCategorySelector,
  placesSearchTermSelector,
  stringifiedPlacesByIdSelector,
  (placeCategories, searchTerm, stringifiedPlaces) => {
    if (!searchTerm) return placeCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(placeCategories).reduce((acc, nextCategory) => {
      const [key, places] = nextCategory
      const newPlaces = places.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedPlaces[id])
      })
      if (newPlaces.length > 0) {
        return {
          ...acc,
          [key]: newPlaces,
        }
      } else {
        return acc
      }
    }, {})
  }
)

export const placesSortedInBookSelector = createSelector(
  placesSortedAtoZSelector,
  currentTimelineSelector,
  (places, bookId) =>
    places.filter((place) => {
      if (place.bookIds.length === 0) return true
      if (place.bookIds.some(isSeries)) return true
      return place.bookIds.includes(bookId)
    })
)

export const visibleSortedPlacesSelector = createSelector(
  allPlacesSelector,
  placeFilterSelector,
  placeFilterIsEmptySelector,
  placeSortSelector,
  (allPlaces, filter, filterIsEmpty, sort) => {
    if (!allPlaces.length) return []

    let visible = allPlaces
    if (!filterIsEmpty) {
      visible = []
      visible = allPlaces.filter((pl) => {
        return Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return pl.tags.includes(val)
            }
            if (attr == 'book') {
              return pl.bookIds.includes(val)
            }
            if (val == '') {
              if (!pl[attr] || pl[attr] == '') return true
            } else {
              if (pl[attr] && pl[attr] == val) return true
            }
            return false
          })
        })
      })
    }

    let sortOperands = sort.split('~')
    let attrName = sortOperands[0]
    let direction = sortOperands[1]
    let sortOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']
    let sorted = sortBy(visible, sortOperand)
    if (direction == 'desc') sorted.reverse()
    return sorted
  }
)

export const placeCustomAttributesThatCanChangeSelector = createSelector(
  allPlacesSelector,
  placeCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
)

export const placesFilterItemsSelector = createSelector(
  currentViewSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  allCardsSelector,
  (currentView, places, notes, cards) => {
    switch (currentView) {
      case 'notes': {
        const filteredItems = places.filter((place) =>
          notes.find((note) => note.places?.includes(place.id))
        )
        return filteredItems
      }
      case 'timeline': {
        const filteredItems = places.filter((place) =>
          cards.find((card) => card.places?.includes(place.id))
        )
        return filteredItems
      }
      default:
        return []
    }
  }
)

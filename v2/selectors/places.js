import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { placeSortSelector, placeFilterSelector, currentTimelineSelector } from './ui'

export const allPlacesSelector = (state) => state.places
// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here
export const placeCustomAttributesSelector = (state) => state.customAttributes.places

export const placesSortedAtoZSelector = createSelector(allPlacesSelector, (places) =>
  sortBy(places, 'name')
)

export const placeFilterIsEmptySelector = createSelector(
  placeFilterSelector,
  placeCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, ...attributes]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
  }
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

export const placesSortedInBookSelector = createSelector(
  placesSortedAtoZSelector,
  currentTimelineSelector,
  (places, bookId) =>
    places.filter((place) => {
      if (place.bookIds.length === 0) return true
      if (place.bookIds.includes('series')) return true
      return place.bookIds.includes(bookId)
    })
)

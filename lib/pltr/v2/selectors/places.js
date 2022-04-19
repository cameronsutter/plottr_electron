import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'
import { placeSortSelector, placeFilterSelector, currentTimelineSelector } from './ui'
import { isSeries } from '../helpers/books'

export const allPlacesSelector = (state) => state.places
// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here
export const placeCustomAttributesSelector = (state) => state.customAttributes.places

const selectId = (state, id) => id

export const singlePlaceSelector = createSelector(allPlacesSelector, selectId, (places, propId) =>
  places.find(({ id }) => id === propId)
)

export const placesSortedAtoZSelector = createSelector(allPlacesSelector, (places) =>
  sortBy(places, 'name')
)

export const placesByCategorySelector = createSelector(allPlacesSelector, (places) =>
  groupBy(places, 'categoryId')
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

function sortEachCategory(visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    let characters = visibleByCategory[k]

    let sorted = sortBy(characters, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

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

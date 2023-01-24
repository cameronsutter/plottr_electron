import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

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

export const stringifiedPlacesByIdSelector = createSelector(allPlacesSelector, (places) => {
  return places.reduce((acc, nextPlace) => {
    return {
      ...acc,
      [nextPlace.id]: JSON.stringify(nextPlace).toLowerCase(),
    }
  }, {})
})

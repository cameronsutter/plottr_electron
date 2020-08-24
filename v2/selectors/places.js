import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

export const allPlacesSelector = state => state.places

export const placesSortedAtoZSelector = createSelector(
  allPlacesSelector,
  (places) => sortBy(places, 'name')
)
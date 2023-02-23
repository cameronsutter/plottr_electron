// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

export const allCategoriesSelector = (state) => state.categories
export const characterCategoriesSelector = (state) => state.categories.characters
export const noteCategoriesSelector = (state) => state.categories.notes
export const tagCategoriesSelector = (state) => state.categories.tags
export const placeCategoriesSelector = (state) => state.categories.places

export const sortedCharacterCategoriesSelector = createSelector(
  characterCategoriesSelector,
  (categories) => sortBy(categories, 'position')
)

export const sortedNoteCategoriesSelector = createSelector(noteCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedTagCategoriesSelector = createSelector(tagCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedPlaceCategoriesSelector = createSelector(placeCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

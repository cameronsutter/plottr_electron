import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

export const allCategoriesSelector = (state) => state.categories
export const characterCategoriesSelector = (state) => state.categories.characters
export const noteCategoriesSelector = (state) => state.categories.notes

export const sortedCharacterCategoriesSelector = createSelector(
  characterCategoriesSelector,
  (categories) => sortBy(categories, 'position')
)

export const sortedNoteCategoriesSelector = createSelector(noteCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

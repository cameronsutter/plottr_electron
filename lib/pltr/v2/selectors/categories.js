import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

export const allCategoriesSelector = (state) => state.categories
export const characterCategoriesSelector = (state) => state.categories.characters

export const sortedCharacterCategoriesSelector = createSelector(
  characterCategoriesSelector,
  (categories) => sortBy(categories, 'position')
)

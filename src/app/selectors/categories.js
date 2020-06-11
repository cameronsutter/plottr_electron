import { createSelector } from 'reselect'

export const allCategoriesSelector = state => state.categories
export const characterCategoriesSelector = state => state.categories.characters
// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

export const allCharactersSelector = (state) => state.characters

// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here

const selectId = (state, id) => id

export const singleCharacterSelector = createSelector(
  allCharactersSelector,
  selectId,
  (characters, propId) => characters.find((ch) => ch.id == propId)
)

export const displayedSingleCharacter = (
  character,
  bookId,
  currentBookAttributeDescirptorsById
) => {
  const currentBookAttributes = character.attributes || []

  const tags =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'tags'
      )
    })?.value ||
    (bookId === 'all' && character.tags) ||
    []

  const description =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'shortDescription'
      )
    })?.value ||
    (bookId === 'all' && character.description) ||
    ''

  const notes =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'description'
      )
    })?.value ||
    (bookId === 'all' && character.notes) ||
    ''

  const category = currentBookAttributes.find((attribute) => {
    return (
      attribute.bookId === bookId &&
      currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
      currentBookAttributeDescirptorsById[attribute.id].name === 'category'
    )
  })
  const categoryId =
    typeof category?.value !== 'undefined'
      ? category?.value
      : (bookId === 'all' && character.categoryId) || null

  return {
    ...character,
    tags,
    description,
    notes,
    categoryId,
  }
}

export const charactersByCategorySelector = createSelector(allCharactersSelector, (characters) =>
  groupBy(characters, 'categoryId')
)

export const charactersSortedAtoZSelector = createSelector(allCharactersSelector, (characters) =>
  sortBy(characters, 'name')
)

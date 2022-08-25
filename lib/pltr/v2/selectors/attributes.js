import { createSelector } from 'reselect'
import { characterAttributeTabSelector } from './ui'

export const attributesSelector = (state) => state.attributes || []

const legacyCharacterCustomAttributesSelector = (state) => state.customAttributes.characters

const bookSelector = (_state, bookId) => bookId

export const characterAttributesForBookSelector = createSelector(
  attributesSelector,
  bookSelector,
  (attributes, bookId) => {
    const characterAttributes = (attributes && attributes.characters) || {}
    return (characterAttributes.books && characterAttributes.books[bookId]) || []
  }
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  legacyCharacterCustomAttributesSelector,
  characterAttributeTabSelector,
  (attributes, legacyAttributes, bookId) => {
    const characterAttributes = (attributes && attributes.characters) || {}
    const bookAttributes = characterAttributes.books || {}
    const newAttributesForAllBooks = bookId === 'all' ? [] : bookAttributes['all'] || []
    const newAttributes = bookAttributes[bookId] || []
    return [...newAttributesForAllBooks, ...newAttributes, ...legacyAttributes]
  }
)

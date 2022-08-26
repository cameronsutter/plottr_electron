import { createSelector } from 'reselect'
import { characterAttributeTabSelector } from './ui'

export const attributesSelector = (state) => state.attributes || []

const legacyCharacterCustomAttributesSelector = (state) => state.customAttributes.characters

export const characterAttributesForBookSelector = createSelector(
  attributesSelector,
  (attributes) => {
    return (attributes && attributes.characters) || []
  }
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  legacyCharacterCustomAttributesSelector,
  characterAttributeTabSelector,
  (attributes, legacyAttributes, bookId) => {
    const bookAttributes = (attributes && attributes.characters) || []
    const newAttributes = bookAttributes.filter((attribute) => {
      return attribute.bookId === bookId || attribute.bookId === 'all'
    })
    return [...newAttributes, ...legacyAttributes]
  }
)

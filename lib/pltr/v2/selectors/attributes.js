import { createSelector } from 'reselect'
import { characterAttributeTabSelector } from './ui'

export const attributesSelector = (state) => state.attributes || []

const legacyCharacterCustomAttributesSelector = (state) => state.customAttributes.characters

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  legacyCharacterCustomAttributesSelector,
  characterAttributeTabSelector,
  (attributes, legacyAttributes, bookId) => {
    const characterAttributes = (attributes && attributes.characters) || {}
    const bookAttributes = characterAttributes.books || {}
    const newAttributes = bookAttributes[bookId] || []
    return [...newAttributes, ...legacyAttributes]
  }
)

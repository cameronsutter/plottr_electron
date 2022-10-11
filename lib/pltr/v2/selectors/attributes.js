import { createSelector } from 'reselect'
import { groupBy, mapValues } from 'lodash'

import { selectedCharacterAttributeTabSelector } from './ui'

export const attributesSelector = (state) => state.attributes || []

const legacyCharacterCustomAttributesSelector = (state) => state.customAttributes.characters

export const characterAttributesForBookSelector = createSelector(
  attributesSelector,
  (attributes) => {
    return (attributes && attributes.characters) || []
  }
)

export const allCharacterAttributesSelector = createSelector(attributesSelector, (attributes) => {
  return (attributes && attributes.characters) || []
})

export const overriddenBookIdSelector = (_state, _characterId, bookId) => bookId

export const characterAttributsForBookByIdSelector = createSelector(
  selectedCharacterAttributeTabSelector,
  characterAttributesForBookSelector,
  overriddenBookIdSelector,
  (selectedBookId, attributeDescriptors, overriddenBookId) => {
    const bookId = overriddenBookId || selectedBookId
    const currentBookAttributeDescriptors = attributeDescriptors.filter((attribute) => {
      return attribute.bookId === bookId
    })
    return mapValues(groupBy(currentBookAttributeDescriptors, 'id'), '0')
  }
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  legacyCharacterCustomAttributesSelector,
  selectedCharacterAttributeTabSelector,
  (attributes, legacyAttributes, bookId) => {
    const bookAttributes = (attributes && attributes.characters) || []
    const newAttributes = bookAttributes.filter((attribute) => {
      return (
        (attribute.bookId === bookId || attribute.bookId === 'all') &&
        attribute.type !== 'base-attribute'
      )
    })
    return [...newAttributes, ...legacyAttributes]
  }
)

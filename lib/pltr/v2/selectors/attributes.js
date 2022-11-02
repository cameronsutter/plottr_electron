import { createSelector } from 'reselect'
import { differenceWith, groupBy, isEqual, mapValues } from 'lodash'

import { selectedCharacterAttributeTabSelector, characterCustomAttributeOrderSelector } from './ui'

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

export const allNonBaseCharacterAttributesSelector = createSelector(
  attributesSelector,
  (attributes) => {
    return ((attributes && attributes.characters) || []).filter((attribute) => {
      return attribute.type !== 'base-attribute'
    })
  }
)

export const overriddenBookIdSelector = (_state, _characterId, bookId) => bookId

export const characterAttributsForBookByIdSelector = createSelector(
  characterAttributesForBookSelector,
  (attributeDescriptors) => {
    return mapValues(groupBy(attributeDescriptors, 'id'), '0')
  }
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  legacyCharacterCustomAttributesSelector,
  selectedCharacterAttributeTabSelector,
  characterCustomAttributeOrderSelector,
  (attributes, legacyAttributes, bookId, order) => {
    const bookAttributes = (attributes && attributes.characters) || []
    const newAttributes = bookAttributes.filter((attribute) => {
      return attribute.type !== 'base-attribute'
    })
    const ordered = order.map((entry) => {
      if (entry.type === 'attributes') {
        return newAttributes.find(({ id }) => {
          return id === entry.id
        })
      } else {
        return legacyAttributes.find(({ name }) => {
          return name === entry.name
        })
      }
    })
    const missing = differenceWith([...newAttributes, ...legacyAttributes], ordered, isEqual)
    return [...ordered, ...missing]
  }
)

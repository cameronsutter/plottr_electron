import { createSelector } from 'reselect'
import { groupBy, mapValues } from 'lodash'

export const attributesSelector = (state) => state.attributes || []

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

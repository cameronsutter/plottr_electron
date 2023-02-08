// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { character, place } from '../store/initialState'

const characterKeys = Object.keys(character)
const placeKeys = Object.keys(place)

export const allCustomAttributesSelector = (state) => state.customAttributes
export const characterCustomAttributesSelector = (state) => state.customAttributes.characters
export const placeCustomAttributesSelector = (state) => state.customAttributes.places
export const cardsCustomAttributesSelector = (state) => state.customAttributes.scenes
export const noteCustomAttributesSelector = (state) => state.customAttributes.notes

export const characterSortCAnamesSelector = createSelector(
  characterCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const placeSortCAnamesSelector = createSelector(
  placeCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const noteSortCAnamesSelector = createSelector(noteCustomAttributesSelector, (attributes) =>
  attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const characterCustomAttributesRestrictedValues = createSelector(
  characterCustomAttributesSelector,
  (attrs) => characterKeys.concat(attrs.map((a) => a.name))
)

export const placeCustomAttributesRestrictedValues = createSelector(
  placeCustomAttributesSelector,
  (attrs) => placeKeys.concat(attrs.map((a) => a.name))
)

export const noteCustomAttributesRestrictedValues = createSelector(
  noteCustomAttributesSelector,
  (attrs) => placeKeys.concat(attrs.map((a) => a.name))
)

const attributeNameSelector = (_state, attributeName) => {
  return attributeName
}

export const legacyCustomCharacterAttributeByName = createSelector(
  characterCustomAttributesSelector,
  attributeNameSelector,
  (customAttributes, name) => {
    return customAttributes.find((attribute) => {
      return attribute.name === name
    })
  }
)

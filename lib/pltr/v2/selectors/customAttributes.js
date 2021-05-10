import { createSelector } from 'reselect'
import { allCharactersSelector } from './characters'
import { allPlacesSelector } from './places'
import { allCardsSelector } from './cards'
import { allNotesSelector } from './notes'
import { character, place } from '../store/initialState'

const characterKeys = Object.keys(character)
const placeKeys = Object.keys(place)

export const allCustomAttributesSelector = (state) => state.customAttributes
export const characterCustomAttributesSelector = (state) => state.customAttributes.characters
export const placeCustomAttributesSelector = (state) => state.customAttributes.places
export const cardsCustomAttributesSelector = (state) => state.customAttributes.scenes
export const notesCustomAttributesSelector = (state) => state.customAttributes.notes

export const characterSortCAnamesSelector = createSelector(
  characterCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const placeSortCAnamesSelector = createSelector(
  placeCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

const noEntityHasAttributeBound = (entities, attrs) => {
  return attrs.reduce((acc, attr) => {
    if (attr.type == 'text') {
      acc.push(attr.name)
      return acc
    }

    const changeable = entities.every((ch) => hasNoValue(ch, attr.name))
    if (changeable) acc.push(attr.name)
    return acc
  }, [])
}

export const characterCustomAttributesThatCanChangeSelector = createSelector(
  allCharactersSelector,
  characterCustomAttributesSelector,
  noEntityHasAttributeBound
)

export const placeCustomAttributesThatCanChangeSelector = createSelector(
  allPlacesSelector,
  placeCustomAttributesSelector,
  noEntityHasAttributeBound
)

export const cardsCustomAttributesThatCanChangeSelector = createSelector(
  allCardsSelector,
  cardsCustomAttributesSelector,
  noEntityHasAttributeBound
)

export const notesCustomAttributesThatCanChangeSelector = createSelector(
  allNotesSelector,
  notesCustomAttributesSelector,
  noEntityHasAttributeBound
)

// you can change a paragraph type back to text if:
// 1. It has no value
// 2. It is a string
// 3. It's value is the same as RCE_INITIAL_VALUE
// 4. It's value is an empty paragraph
// Otherwise, a paragraph type can not be changed back
function hasNoValue(item, attr) {
  const val = item[attr]
  if (!val) return true
  if (typeof val === 'string') return true

  if (!val.length) return true
  if (val.length > 1) return false // more than 1 paragraph
  if (val[0].children.length > 1) return false // more than 1 text node
  if (val[0].children[0].text == '') return true // no text
  return false
}

export const characterCustomAttributesRestrictedValues = createSelector(
  characterCustomAttributesSelector,
  (attrs) => characterKeys.concat(attrs.map((a) => a.name))
)

export const placeCustomAttributesRestrictedValues = createSelector(
  placeCustomAttributesSelector,
  (attrs) => placeKeys.concat(attrs.map((a) => a.name))
)

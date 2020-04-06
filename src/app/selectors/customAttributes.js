import deep from 'deep-diff'
import { createSelector } from 'reselect'
import { allCharactersSelector } from './characters'
import { allPlacesSelector } from './places'
import { RCE_INITIAL_VALUE } from '../../../shared/initialState'
const otherPossibleValue = [ { "children": [ { "text": "" } ], "type": "paragraph" } ]

export const allCustomAttributesSelector = state => state.customAttributes
export const characterCustomAttributesSelector = state => state.customAttributes.characters
export const placeCustomAttributesSelector = state => state.customAttributes.places

export const characterSortCAnamesSelector = createSelector(
  characterCustomAttributesSelector,
  (attributes) => attributes.filter(attr => attr.type == 'text').map(attr => attr.name)
)

export const placeSortCAnamesSelector = createSelector(
  placeCustomAttributesSelector,
  (attributes) => attributes.filter(attr => attr.type == 'text').map(attr => attr.name)
)

export const characterCustomAttributesThatCanChangeSelector = createSelector(
  allCharactersSelector,
  characterCustomAttributesSelector,
  (characters, attrs) => {
    return attrs.reduce((acc, attr) => {
      if (attr.type == 'text') {
        acc.push(attr.name)
        return acc
      }

      // you can change a paragraph type back to text if:
      // 1. It has no value
      // 2. It is a string
      // 3. It's value is the same as RCE_INITIAL_VALUE
      // 4. It's value is an empty paragraph
      // Otherwise, a paragraph type can not be changed back
      let changeable = characters.every(ch => {
        if (!ch[attr.name]) return true
        if (typeof ch[attr.name] === 'string') return true
        let diff = deep.diff(RCE_INITIAL_VALUE, ch[attr.name])
        if (!diff) return true
        diff = deep.diff(otherPossibleValue, ch[attr.name])
        if (!diff) return true
        return false
      })
      if (changeable) acc.push(attr.name)
      return acc
    }, [])
  }
)

export const placeCustomAttributesThatCanChangeSelector = createSelector(
  allPlacesSelector,
  placeCustomAttributesSelector,
  (places, attrs) => {
    return attrs.reduce((acc, attr) => {
      if (attr.type == 'text') {
        acc.push(attr.name)
        return acc
      }

      // you can change a paragraph type back to text if:
      // 1. It has no value
      // 2. It is a string
      // 3. It's value is the same as RCE_INITIAL_VALUE
      // 4. It's value is an empty paragraph
      // Otherwise, a paragraph type can not be changed back
      let changeable = places.every(pl => {
        if (!pl[attr.name]) return true
        if (typeof pl[attr.name] === 'string') return true
        let diff = deep.diff(RCE_INITIAL_VALUE, pl[attr.name])
        if (!diff) return true
        diff = deep.diff(otherPossibleValue, pl[attr.name])
        if (!diff) return true
        return false
      })
      if (changeable) acc.push(attr.name)
      return acc
    }, [])
  }
)
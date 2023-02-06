import { createSelector } from 'reselect'

import {
  noEntityHasAttributeBound,
  noEntityHasLegacyAttributeBound,
} from './noEntitiyHasValueBound'

// Other selector dependencies
import { allCharactersSelector } from './charactersFirstOrder'
import { attributesSelector } from './attributesFirstOrder'
import {
  cardsCustomAttributesSelector,
  characterCustomAttributesSelector,
  noteCustomAttributesSelector,
  placeCustomAttributesSelector,
} from './customAttributesFirstOrder'
import { currentViewSelector } from './secondOrder'
import { characterAttributesForCurrentBookSelector } from './charactersThirdOrder'

export const characterCustomAttributesThatCanChangeSelector = createSelector(
  allCharactersSelector,
  characterCustomAttributesSelector,
  attributesSelector,
  (characters, legacyAttributes, attributes) => {
    const characterBookAttributes = attributes.characters || []
    return [
      ...noEntityHasLegacyAttributeBound(characters, legacyAttributes),
      ...noEntityHasAttributeBound(characters, characterBookAttributes),
    ]
  }
)

const onlyText = ({ type }) => {
  return type === 'text'
}

export const customAttributesFilter = createSelector(
  currentViewSelector,
  characterAttributesForCurrentBookSelector,
  placeCustomAttributesSelector,
  noteCustomAttributesSelector,
  cardsCustomAttributesSelector,
  (
    currentView,
    characterAttributesForCurrentBook,
    placeCustomAttributes,
    noteCustomAttributes,
    cardsCustomAttributes
  ) => {
    switch (currentView) {
      case 'characters':
        return characterAttributesForCurrentBook
      case 'places':
        return placeCustomAttributes.filter(onlyText)
      case 'notes':
        return noteCustomAttributes.filter(onlyText)
      case 'timeline':
        return cardsCustomAttributes.filter(onlyText)
      default:
        return {}
    }
  }
)

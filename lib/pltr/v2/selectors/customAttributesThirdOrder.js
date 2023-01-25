import { createSelector } from 'reselect'

import {
  noEntityHasAttributeBound,
  noEntityHasLegacyAttributeBound,
} from './noEntitiyHasValueBound'

// Other selector dependencies
import { allCharactersSelector } from './charactersFirstOrder'
import { attributesSelector } from './attributesFirstOrder'
import { characterCustomAttributesSelector } from './customAttributesFirstOrder'

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

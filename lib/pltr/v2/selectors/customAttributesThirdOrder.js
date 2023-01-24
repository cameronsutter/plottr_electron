import { createSelector } from 'reselect'

import {
  noEntityHasAttributeBound,
  noEntityHasLegacyAttributeBound,
} from './noEntitiyHasValueBound'

// Other selector dependencies
import { allCharactersSelector } from './characters'
import { attributesSelector } from './attributes'
import { characterCustomAttributesSelector } from './customAttributes'

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

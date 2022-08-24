import {
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
} from '../constants/ActionTypes'

export const editCharacterAttributeMetadata = (id, name, type) => {
  return {
    type: EDIT_CHARACTER_ATTRIBUTE_METADATA,
    id,
    name,
    attributeType: type,
  }
}

export const deleteCharacterAttribute = (id) => {
  return {
    type: DELETE_CHARACTER_ATTRIBUTE,
    id,
  }
}

export function reorderCharacterAttribute(attribute, toIndex) {
  return {
    type: REORDER_CHARACTER_ATTRIBUTE_METADATA,
    attribute,
    toIndex,
  }
}

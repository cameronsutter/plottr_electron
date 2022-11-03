import {
  DELETE_CHARACTER_ATTRIBUTE,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
  LOAD_ATTRIBUTES,
} from '../constants/ActionTypes'

export const editCharacterAttributeMetadata = (id, name, type, oldName) => (dispatch, getState) => {
  dispatch({
    type: EDIT_CHARACTER_ATTRIBUTE_METADATA,
    id,
    name,
    oldName,
    attributeType: type,
  })
}

export const deleteCharacterAttribute = (id, name) => {
  if (name && !id) {
    return {
      type: DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
      attributeName: name,
    }
  }

  return {
    type: DELETE_CHARACTER_ATTRIBUTE,
    id,
  }
}

export function reorderCharacterAttribute(attributeId, toIndex, attributeName) {
  return {
    type: REORDER_CHARACTER_ATTRIBUTE_METADATA,
    attributeId,
    toIndex,
    attributeName,
  }
}

export function load(patching, attributes) {
  return { type: LOAD_ATTRIBUTES, attributes }
}

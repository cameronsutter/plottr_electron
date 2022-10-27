import {
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
} from '../constants/ActionTypes'

export const editCharacterAttributeMetadata = (id, name, type, oldName) => (dispatch, getState) => {
  dispatch({
    type: EDIT_CHARACTER_ATTRIBUTE_METADATA,
    id,
    name,
    attributeType: type,
  })
}

export const deleteCharacterAttribute = (id, name) => {
  return {
    type: DELETE_CHARACTER_ATTRIBUTE,
    id,
    name,
  }
}

export function reorderCharacterAttribute(attributeId, toIndex) {
  return {
    type: REORDER_CHARACTER_ATTRIBUTE_METADATA,
    attributeId,
    toIndex,
  }
}

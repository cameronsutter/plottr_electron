import { removeCharacterAttr, editCharacterAttr } from './customAttributes'
import { characterCustomAttributesSelector } from '../selectors/customAttributes'
import {
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
} from '../constants/ActionTypes'

export const editCharacterAttributeMetadata = (id, name, type, oldName) => (dispatch, getState) => {
  // Legacy custom attributes are keyed by their name
  if (!id) {
    // Now we need to find the data needed for the transformation.
    const newAttribute = {
      name,
      type,
    }
    const characterCustomAttributes = characterCustomAttributesSelector(getState().present)
    const oldAttributeIndex = characterCustomAttributes.findIndex((attribute) => {
      return attribute.name === oldName
    })
    const oldAttribute =
      (oldAttributeIndex || oldAttributeIndex === 0) && characterCustomAttributes[oldAttributeIndex]

    if (oldAttribute) {
      dispatch(editCharacterAttr(oldAttributeIndex, oldAttribute, newAttribute))
    }
    return
  }

  dispatch({
    type: EDIT_CHARACTER_ATTRIBUTE_METADATA,
    id,
    name,
    attributeType: type,
  })
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

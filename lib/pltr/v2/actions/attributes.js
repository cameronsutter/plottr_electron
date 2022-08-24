import { EDIT_CHARACTER_ATTRIBUTE_METADATA } from '../constants/ActionTypes'

export const editCharacterAttributeMetadata = (id, name, type) => {
  return {
    type: EDIT_CHARACTER_ATTRIBUTE_METADATA,
    id,
    name,
    attributeType: type,
  }
}

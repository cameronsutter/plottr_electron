import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  ADD_CHARACTER_WITH_VALUES,
  ATTACH_BOOK_TO_CHARACTER,
  ATTACH_TAG_TO_CHARACTER,
  DELETE_CHARACTER,
  EDIT_CHARACTER,
  LOAD_CHARACTERS,
  ADD_TEMPLATE_TO_CHARACTER,
  REMOVE_TEMPLATE_FROM_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  DUPLICATE_CHARACTER,
  CREATE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
} from '../constants/ActionTypes'
import { editorMetadataIfPresent } from '../helpers/editors'
import { characterAttributesForCurrentBookSelector } from '../selectors/attributes'
import { character } from '../store/initialState'
import { escapeBracesInAttributeName } from './customAttributes'
import { attrIfPresent } from '../helpers/editors'

export function addCharacter(name) {
  return {
    type: ADD_CHARACTER,
    name: name || character.name,
    description: character.description,
    notes: character.notes,
  }
}

export function addCharacterWithValues(character) {
  return { type: ADD_CHARACTER_WITH_VALUES, character }
}

export function addCharacterWithTemplate(name, templateData) {
  return {
    type: ADD_CHARACTER_WITH_TEMPLATE,
    name: name || character.name,
    description: character.description,
    notes: character.notes,
    templateData,
  }
}

export function editCharacter(id, attributes, editorPath, selection) {
  return { type: EDIT_CHARACTER, id, attributes, ...editorMetadataIfPresent(editorPath, selection) }
}

export function editCharacterTemplateAttribute(id, templateId, name, value, editorPath, selection) {
  return {
    type: EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
    id,
    templateId,
    name,
    value,
    ...editorMetadataIfPresent(editorPath, selection),
  }
}

export function addTemplateToCharacter(id, templateData) {
  return { type: ADD_TEMPLATE_TO_CHARACTER, id, templateData }
}

export function deleteCharacter(id) {
  return { type: DELETE_CHARACTER, id }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_CHARACTER, id, tagId }
}

export function addBook(id, bookId) {
  return { type: ATTACH_BOOK_TO_CHARACTER, id, bookId }
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_CHARACTER, id, tagId }
}

export function removeBook(id, bookId) {
  return { type: REMOVE_BOOK_FROM_CHARACTER, id, bookId }
}

export function removeTemplateFromCharacter(id, templateId) {
  return { type: REMOVE_TEMPLATE_FROM_CHARACTER, id, templateId }
}

export function load(patching, characters) {
  return { type: LOAD_CHARACTERS, patching, characters }
}

export function duplicateCharacter(id) {
  return { type: DUPLICATE_CHARACTER, id }
}

export function createCharacterAttribute(attribute) {
  return {
    type: CREATE_CHARACTER_ATTRIBUTE,
    attribute: escapeBracesInAttributeName(attribute),
  }
}

export const editCharacterAttributeValue =
  (characterId, attributeId, value) => (dispatch, getState) => {
    const state = getState()
    const characterAttributesForBook = characterAttributesForCurrentBookSelector(state)
    const isANewAttribute = characterAttributesForBook.some((attribute) => {
      return attribute.attributeId === attributeId
    })
    if (isANewAttribute) {
      dispatch({
        type: EDIT_CHARACTER_ATTRIBUTE_VALUE,
        characterId,
        attributeId,
        value,
      })
    }

    dispatch(editCharacter(characterId, attrIfPresent(attributeId, value), null, null))
  }

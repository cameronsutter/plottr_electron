import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
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
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  EDIT_CHARACTER_NAME,
  EDIT_CHARACTER_IMAGE,
} from '../constants/ActionTypes'
import { editorMetadataIfPresent } from '../helpers/editors'
import { characterAttributesForCurrentBookSelector } from '../selectors/attributes'
import { character } from '../store/initialState'
import { escapeBracesInAttributeName } from './customAttributes'
import { selectedCharacterAttributeTabSelector } from '../selectors/ui'
import { allBookIdsSelector } from '../selectors/books'

export function addCharacter(name) {
  return {
    type: ADD_CHARACTER,
    name: name || character.name,
    description: character.description,
    notes: character.notes,
  }
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

export function editCharacterName(id, name) {
  return {
    type: EDIT_CHARACTER_NAME,
    id,
    name,
  }
}

export function editCharacterImage(id, imageId) {
  return {
    type: EDIT_CHARACTER_IMAGE,
    id,
    imageId,
  }
}

export const editCharacterTemplateAttribute =
  (id, templateId, name, value, editorPath, selection) => (dispatch, getState) => {
    const state = getState().present
    const bookId = selectedCharacterAttributeTabSelector(state)

    dispatch({
      type: EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
      id,
      templateId,
      name,
      value,
      bookId,
      ...editorMetadataIfPresent(editorPath, selection),
    })
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

export const addBook = (id, bookId) => (dispatch, getState) => {
  const bookIds = allBookIdsSelector(getState().present)

  if (bookIds.indexOf(bookId) > -1) {
    dispatch({ type: ATTACH_BOOK_TO_CHARACTER, id, bookId })
  }
  // TODO: error message?
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
    const state = getState().present
    const characterAttributesForBook = characterAttributesForCurrentBookSelector(state)
    const selectedBook = selectedCharacterAttributeTabSelector(state)
    const newAttribute = characterAttributesForBook.find((attribute) => {
      return attribute.id === attributeId
    })
    if (newAttribute) {
      if (newAttribute.bookId !== selectedBook) {
        // This is the first time we're editing an attribute for the
        // current book that was previously only defined for the whole
        // series.
        dispatch({
          type: EDIT_CHARACTER_ATTRIBUTE_VALUE,
          bookId: selectedBook,
          characterId,
          attributeId,
          value,
        })
        return
      }
      dispatch({
        type: EDIT_CHARACTER_ATTRIBUTE_VALUE,
        characterId,
        attributeId,
        value,
      })
      return
    }
  }

export const editShortDescription = (characterId, shortDescription) => {
  return {
    type: EDIT_CHARACTER_SHORT_DESCRIPTION,
    characterId,
    value: shortDescription,
  }
}

export const editDescription = (characterId, description) => {
  return {
    type: EDIT_CHARACTER_DESCRIPTION,
    characterId,
    value: description,
  }
}

export const editCategory = (characterId, categoryId) => {
  return {
    type: EDIT_CHARACTER_CATEGORY,
    characterId,
    value: categoryId,
  }
}

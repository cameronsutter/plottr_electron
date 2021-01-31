import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_VALUES,
  ATTACH_TAG_TO_CHARACTER,
  ATTACH_BOOK_TO_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  EDIT_CHARACTER,
  DELETE_CHARACTER,
} from '../constants/ActionTypes'
import { character } from '../store/initialState'

export function addCharacter() {
  return {
    type: ADD_CHARACTER,
    name: character.name,
    description: character.description,
    notes: character.notes,
  }
}

export function addCharacterWithValues(character) {
  return { type: ADD_CHARACTER_WITH_VALUES, character }
}

export function addCharacterWithTemplate(templateData) {
  return {
    type: ADD_CHARACTER_WITH_TEMPLATE,
    name: character.name,
    description: character.description,
    notes: character.notes,
    templateData,
  }
}

export function editCharacter(id, attributes) {
  return { type: EDIT_CHARACTER, id, attributes }
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

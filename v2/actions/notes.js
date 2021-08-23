import {
  ADD_NOTE,
  EDIT_NOTE,
  EDIT_NOTE_TEMPLATE_ATTRIBUTE,
  DELETE_NOTE,
  ATTACH_CHARACTER_TO_NOTE,
  ATTACH_PLACE_TO_NOTE,
  ATTACH_TAG_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  REMOVE_PLACE_FROM_NOTE,
  REMOVE_TAG_FROM_NOTE,
  REMOVE_BOOK_FROM_NOTE,
  ATTACH_BOOK_TO_NOTE,
  LOAD_NOTES,
} from '../constants/ActionTypes'
import { editorMetadataIfPresent } from '../helpers/editors'
import { note } from '../store/initialState'

export function addNote() {
  return { type: ADD_NOTE, title: note.title, content: note.content }
}

export function addNoteWithValues(title, content) {
  return { type: ADD_NOTE, title, content }
}

export function editNote(id, attributes, editorPath, selection) {
  return { type: EDIT_NOTE, id, attributes, ...editorMetadataIfPresent(editorPath, selection) }
}

export function editNoteTemplateAttribute(id, templateId, name, value, editorPath, selection) {
  return {
    type: EDIT_NOTE_TEMPLATE_ATTRIBUTE,
    id,
    templateId,
    name,
    value,
    ...editorMetadataIfPresent(editorPath, selection),
  }
}

export function deleteNote(id) {
  return { type: DELETE_NOTE, id }
}

export function addCharacter(id, characterId) {
  return { type: ATTACH_CHARACTER_TO_NOTE, id, characterId }
}

export function addPlace(id, placeId) {
  return { type: ATTACH_PLACE_TO_NOTE, id, placeId }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_NOTE, id, tagId }
}

export function addBook(id, bookId) {
  return { type: ATTACH_BOOK_TO_NOTE, id, bookId }
}

export function removeCharacter(id, characterId) {
  return { type: REMOVE_CHARACTER_FROM_NOTE, id, characterId }
}

export function removePlace(id, placeId) {
  return { type: REMOVE_PLACE_FROM_NOTE, id, placeId }
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_NOTE, id, tagId }
}

export function removeBook(id, bookId) {
  return { type: REMOVE_BOOK_FROM_NOTE, id, bookId }
}

export function load(patching, notes) {
  return { type: LOAD_NOTES, patching, notes }
}

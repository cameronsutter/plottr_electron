import {
  ADD_CHARACTER_ATTRIBUTE,
  ADD_PLACES_ATTRIBUTE,
  ADD_CARDS_ATTRIBUTE,
  ADD_LINES_ATTRIBUTE,
  ADD_NOTES_ATTRIBUTE,
  REMOVE_CHARACTER_ATTRIBUTE,
  REMOVE_PLACES_ATTRIBUTE,
  REMOVE_CARDS_ATTRIBUTE,
  REMOVE_LINES_ATTRIBUTE,
  REMOVE_NOTES_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE,
  EDIT_CARDS_ATTRIBUTE,
  EDIT_NOTES_ATTRIBUTE,
  REORDER_CHARACTER_ATTRIBUTE,
  REORDER_PLACES_ATTRIBUTE,
  REORDER_CARDS_ATTRIBUTE,
  REORDER_NOTES_ATTRIBUTE,
} from '../constants/ActionTypes'

export function addCharacterAttr(attribute) {
  return { type: ADD_CHARACTER_ATTRIBUTE, attribute }
}

export function removeCharacterAttr(attribute) {
  // attribute is the attr's name
  return { type: REMOVE_CHARACTER_ATTRIBUTE, attribute }
}

export function editCharacterAttr(index, oldAttribute, newAttribute) {
  return { type: EDIT_CHARACTER_ATTRIBUTE, index, oldAttribute, newAttribute }
}

export function addPlaceAttr(attribute) {
  return { type: ADD_PLACES_ATTRIBUTE, attribute }
}

export function removePlaceAttr(attribute) {
  // attribute is the attr's name
  return { type: REMOVE_PLACES_ATTRIBUTE, attribute }
}

export function editPlaceAttr(index, oldAttribute, newAttribute) {
  return { type: EDIT_PLACES_ATTRIBUTE, index, oldAttribute, newAttribute }
}

export function addLineAttr(attribute) {
  return { type: ADD_LINES_ATTRIBUTE, attribute }
}

export function removeLineAttr(attribute) {
  return { type: REMOVE_LINES_ATTRIBUTE, attribute }
}

export function addCardAttr(attribute) {
  return { type: ADD_CARDS_ATTRIBUTE, attribute }
}

export function editCardAttr(index, oldAttribute, newAttribute) {
  return { type: EDIT_CARDS_ATTRIBUTE, index, oldAttribute, newAttribute }
}

export function removeCardAttr(attribute) {
  return { type: REMOVE_CARDS_ATTRIBUTE, attribute }
}

export function reorderCardsAttribute(attribute, toIndex) {
  return { type: REORDER_CARDS_ATTRIBUTE, attribute, toIndex }
}

export function reorderCharacterAttribute(attribute, toIndex) {
  return { type: REORDER_CHARACTER_ATTRIBUTE, attribute, toIndex }
}

export function reorderPlacesAttribute(attribute, toIndex) {
  return { type: REORDER_PLACES_ATTRIBUTE, attribute, toIndex }
}

export function addNoteAttr(attribute) {
  return { type: ADD_NOTES_ATTRIBUTE, attribute }
}

export function editNoteAttr(index, oldAttribute, newAttribute) {
  return { type: EDIT_NOTES_ATTRIBUTE, index, oldAttribute, newAttribute }
}

export function removeNoteAttr(attribute) {
  return { type: REMOVE_NOTES_ATTRIBUTE, attribute }
}

export function reorderNotesAttribute(attribute, toIndex) {
  return { type: REORDER_NOTES_ATTRIBUTE, attribute, toIndex }
}

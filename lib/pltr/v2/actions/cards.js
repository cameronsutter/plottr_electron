import {
  ADD_CARD,
  EDIT_CARD_DETAILS,
  EDIT_CARD_COORDINATES,
  CHANGE_LINE,
  CHANGE_BEAT,
  CHANGE_BOOK,
  REORDER_CARDS_WITHIN_LINE,
  REORDER_CARDS_IN_BEAT,
  DELETE_CARD,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_PLACE_TO_CARD,
  REMOVE_PLACE_FROM_CARD,
  ATTACH_TAG_TO_CARD,
  REMOVE_TAG_FROM_CARD,
  ADD_CARD_IN_BEAT,
} from '../constants/ActionTypes'

export function addCard(card) {
  return { type: ADD_CARD, card }
}

export function addNewCardInBeat(newCard, reorderIds) {
  return { type: ADD_CARD_IN_BEAT, newCard, reorderIds }
}

export function editCard(id, title, description, templates, attrs) {
  return { type: EDIT_CARD_DETAILS, id, attributes: { title, description, templates, ...attrs } }
}

export function editCardAttributes(id, attributes) {
  return { type: EDIT_CARD_DETAILS, id, attributes }
}

export function editCardCoordinates(id, lineId, beatId, bookId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, beatId, bookId }
}

export function changeLine(id, lineId, bookId) {
  return { type: CHANGE_LINE, id, lineId, bookId }
}

export function changeBeat(id, beatId, bookId) {
  return { type: CHANGE_BEAT, id, beatId, bookId }
}

export function changeBook(id, bookId) {
  return { type: CHANGE_BOOK, id, bookId }
}

export function reorderCardsWithinLine(beatId, lineId, ids) {
  return { type: REORDER_CARDS_WITHIN_LINE, beatId, lineId, ids }
}

export function reorderCardsInBeat(
  beatId,
  lineId,
  newOrderInBeat,
  newOrderWithinLine,
  newIdInBeat
) {
  return {
    type: REORDER_CARDS_IN_BEAT,
    beatId,
    lineId,
    newOrderInBeat,
    newOrderWithinLine,
    newIdInBeat,
  }
}

export function deleteCard(id) {
  return { type: DELETE_CARD, id }
}

export function addCharacter(id, characterId) {
  return { type: ATTACH_CHARACTER_TO_CARD, id, characterId }
}

export function addPlace(id, placeId) {
  return { type: ATTACH_PLACE_TO_CARD, id, placeId }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_CARD, id, tagId }
}

export function removeCharacter(id, characterId) {
  return { type: REMOVE_CHARACTER_FROM_CARD, id, characterId }
}

export function removePlace(id, placeId) {
  return { type: REMOVE_PLACE_FROM_CARD, id, placeId }
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_CARD, id, tagId }
}

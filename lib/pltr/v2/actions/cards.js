import {
  ADD_CARD,
  EDIT_CARD_DETAILS,
  EDIT_CARD_COORDINATES,
  CHANGE_LINE,
  CHANGE_SCENE,
  CHANGE_BOOK,
  REORDER_CARDS_WITHIN_LINE,
  REORDER_CARDS_IN_CHAPTER,
  DELETE_CARD,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_PLACE_TO_CARD,
  REMOVE_PLACE_FROM_CARD,
  ATTACH_TAG_TO_CARD,
  REMOVE_TAG_FROM_CARD,
  ADD_CARD_IN_CHAPTER,
} from '../constants/ActionTypes'

export function addCard(card) {
  return { type: ADD_CARD, card }
}

export function addNewCardInChapter(newCard, reorderIds) {
  return { type: ADD_CARD_IN_CHAPTER, newCard, reorderIds }
}

export function editCard(id, title, description, templates, attrs) {
  return { type: EDIT_CARD_DETAILS, id, attributes: { title, description, templates, ...attrs } }
}

export function editCardCoordinates(id, lineId, chapterId, bookId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, chapterId, bookId }
}

export function changeLine(id, lineId, bookId) {
  return { type: CHANGE_LINE, id, lineId, bookId }
}

export function changeScene(id, chapterId, bookId) {
  return { type: CHANGE_SCENE, id, chapterId, bookId }
}

export function changeBook(id, bookId) {
  return { type: CHANGE_BOOK, id, bookId }
}

export function reorderCardsWithinLine(chapterId, lineId, ids) {
  return { type: REORDER_CARDS_WITHIN_LINE, chapterId, lineId, ids }
}

export function reorderCardsInChapter(
  chapterId,
  lineId,
  newOrderInChapter,
  newOrderWithinLine,
  newIdInChapter
) {
  return {
    type: REORDER_CARDS_IN_CHAPTER,
    chapterId,
    lineId,
    newOrderInChapter,
    newOrderWithinLine,
    newIdInChapter,
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

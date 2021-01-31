import {
  ADD_CARD,
  EDIT_CARD_DETAILS,
  EDIT_CARD_COORDINATES,
  CHANGE_LINE,
  CHANGE_SCENE,
  DELETE_CARD,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_PLACE_TO_CARD,
  REMOVE_PLACE_FROM_CARD,
  ATTACH_TAG_TO_CARD,
  REMOVE_TAG_FROM_CARD,
} from '../constants/ActionTypes'

export function addCard(card) {
  return { type: ADD_CARD, card }
}

export function editCard(id, title, description) {
  return { type: EDIT_CARD_DETAILS, id, title, description }
}

export function editCardCoordinates(id, lineId, sceneId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, sceneId }
}

export function changeLine(id, lineId) {
  return { type: CHANGE_LINE, id, lineId }
}

export function changeScene(id, sceneId) {
  return { type: CHANGE_SCENE, id, sceneId }
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

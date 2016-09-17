import { ADD_CARD, EDIT_CARD_DETAILS, EDIT_CARD_COORDINATES, CHANGE_LINE, CHANGE_SCENE, DELETE_CARD } from 'constants/ActionTypes'

export function addCard (card) {
  return { type: ADD_CARD, card }
}

export function editCard (id, title, description, characters, places, tags) {
  return { type: EDIT_CARD_DETAILS, id, title, description, characters, places, tags }
}

export function editCardCoordinates (id, lineId, sceneId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, sceneId }
}

export function changeLine (id, lineId) {
  return { type: CHANGE_LINE, id, lineId }
}

export function changeScene (id, sceneId) {
  return { type: CHANGE_SCENE, id, sceneId }
}

export function deleteCard (id) {
  return { type: DELETE_CARD, id }
}

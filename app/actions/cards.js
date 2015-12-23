import { ADD_CARD, EDIT_CARD_DETAILS, EDIT_CARD_COORDINATES, DELETE_CARD } from 'constants/ActionTypes'

export function addCard (card) {
  return { type: ADD_CARD, card }
}

export function editCard (id, title, description, characters, places, tags) {
  return { type: EDIT_CARD_DETAILS, id, title, description, characters, places, tags }
}

export function editCardCoordinates (id, lineId, sceneId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, sceneId }
}

export function deleteCard (id) {
  return { type: DELETE_CARD, id }
}

import { ADD_CARD, EDIT_CARD_TITLE, EDIT_CARD_DESCRIPTION, EDIT_CARD_DETAILS, EDIT_CARD_COORDINATES, DELETE_CARD } from 'constants/ActionTypes'

export function addCard (card) {
  return { type: ADD_CARD, card }
}

export function editCardTitle (id, title) {
  return { type: EDIT_CARD_TITLE, id, title }
}

export function editCardDescription (id, description) {
  return { type: EDIT_CARD_DESCRIPTION, id, description }
}

export function editCard (id, title, description) {
  return { type: EDIT_CARD_DETAILS, id, title, description }
}

export function editCardCoordinates (id, lineId, sceneId) {
  return { type: EDIT_CARD_COORDINATES, id, lineId, sceneId }
}

export function deleteCard (id) {
  return { type: DELETE_CARD, id }
}

import { ADD_CARD, EDIT_CARD_TITLE, EDIT_CARD_DESCRIPTION, EDIT_CARD_DETAILS, CHANGE_LINE, CHANGE_SCENE } from '../constants/ActionTypes'

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

export function changeLine (id, lineId) {
  return { type: CHANGE_LINE, id, lineId }
}

export function changeScene (id, sceneId) {
  return { type: CHANGE_SCENE, id, sceneId }
}

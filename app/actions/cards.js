import { ADD_CARD, EDIT_CARD_TITLE, EDIT_CARD_DESCRIPTION, CHANGE_LINE, CHANGE_SCENE } from '../constants/ActionTypes'

export function addCard (card) {
  return { type: ADD_CARD, card }
}

export function editCardTitle (newTitle) {
  return { type: EDIT_CARD_TITLE, title: newTitle }
}

export function editCardDescription (newDesc) {
  return { type: EDIT_CARD_DESCRIPTION, description: newDesc }
}

export function changeLine (id, lineId) {
  return { type: CHANGE_LINE, id, lineId }
}

export function changeScene (id, sceneId) {
  return { type: CHANGE_SCENE, id, sceneId }
}

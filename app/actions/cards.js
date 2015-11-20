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

export function changeLine (newLineId) {
  return { type: CHANGE_LINE, lineId: newLineId }
}

export function changeScene (newSceneId) {
  return { type: CHANGE_SCENE, sceneId: newSceneId }
}

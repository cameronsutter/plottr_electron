import { ADD_CHARACTER_ATTR, ADD_PLACES_ATTR,
  ADD_CARDS_ATTR, ADD_LINES_ATTR,
  ADD_SCENES_ATTR, REMOVE_CHARACTER_ATTR,
  REMOVE_PLACES_ATTR, REMOVE_CARDS_ATTR,
  REMOVE_LINES_ATTR, REMOVE_SCENES_ATTR } from '../constants/ActionTypes'

export function addCharacterAttr (attribute) {
  return { type: ADD_CHARACTER_ATTR, attribute }
}

export function removeCharacterAttr (attribute) {
  return { type: REMOVE_CHARACTER_ATTR, attribute}
}

export function addPlaceAttr (attribute) {
  return { type: ADD_PLACES_ATTR, attribute }
}

export function removePlaceAttr (attribute) {
  return { type: REMOVE_PLACES_ATTR, attribute }
}

export function addCardAttr (attribute) {
  return { type: ADD_CARDS_ATTR, attribute }
}

export function removeCardAttr (attribute) {
  return { type: REMOVE_CARDS_ATTR, attribute }
}

export function addLineAttr (attribute) {
  return { type: ADD_LINES_ATTR, attribute }
}

export function removeLineAttr (attribute) {
  return { type: REMOVE_LINES_ATTR, attribute }
}

export function addSceneAttr (attribute) {
  return { type: ADD_SCENES_ATTR, attribute }
}

export function removeSceneAttr (attribute) {
  return { type: REMOVE_SCENES_ATTR, attribute }
}

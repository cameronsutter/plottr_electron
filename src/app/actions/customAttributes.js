import { ADD_CHARACTER_ATTRIBUTE, ADD_PLACES_ATTRIBUTE, ADD_CARDS_ATTRIBUTE, ADD_LINES_ATTRIBUTE,
  ADD_SCENES_ATTRIBUTE, REMOVE_CHARACTER_ATTRIBUTE, REMOVE_PLACES_ATTRIBUTE, REMOVE_CARDS_ATTRIBUTE,
  REMOVE_LINES_ATTRIBUTE, REMOVE_SCENES_ATTRIBUTE, EDIT_CHARACTER_ATTRIBUTE, EDIT_PLACES_ATTRIBUTE, 
  REORDER_CHARACTER_ATTRIBUTE, REORDER_PLACES_ATTRIBUTE,
} from '../constants/ActionTypes'

export function addCharacterAttr (attribute) {
  return { type: ADD_CHARACTER_ATTRIBUTE, attribute }
}

export function removeCharacterAttr (attribute) { // attribute is the attr's name
  return { type: REMOVE_CHARACTER_ATTRIBUTE, attribute}
}

export function editCharacterAttr (index, oldAttribute, newAttribute) {
  return { type: EDIT_CHARACTER_ATTRIBUTE, index, oldAttribute, newAttribute}
}

export function addPlaceAttr (attribute) {
  return { type: ADD_PLACES_ATTRIBUTE, attribute }
}

export function removePlaceAttr (attribute) { // attribute is the attr's name
  return { type: REMOVE_PLACES_ATTRIBUTE, attribute }
}

export function editPlaceAttr (index, oldAttribute, newAttribute) {
  return { type: EDIT_PLACES_ATTRIBUTE, index, oldAttribute, newAttribute}
}

export function addCardAttr (attribute) {
  return { type: ADD_CARDS_ATTRIBUTE, attribute }
}

export function removeCardAttr (attribute) {
  return { type: REMOVE_CARDS_ATTRIBUTE, attribute }
}

export function addLineAttr (attribute) {
  return { type: ADD_LINES_ATTRIBUTE, attribute }
}

export function removeLineAttr (attribute) {
  return { type: REMOVE_LINES_ATTRIBUTE, attribute }
}

export function addSceneAttr (attribute) {
  return { type: ADD_SCENES_ATTRIBUTE, attribute }
}

export function removeSceneAttr (attribute) {
  return { type: REMOVE_SCENES_ATTRIBUTE, attribute }
}

export function reorderCharacterAttribute (attribute, toIndex) {
  return {
    type: REORDER_CHARACTER_ATTRIBUTE,
    attribute,
    toIndex,
  }
}

export function reorderPlacesAttribute (attribute, toIndex) {
  return {
    type: REORDER_PLACES_ATTRIBUTE,
    attribute,
    toIndex,
  }
}

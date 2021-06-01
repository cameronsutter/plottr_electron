import {
  ADD_TAG,
  ADD_TAG_WITH_VALUES,
  ADD_CREATED_TAG,
  EDIT_TAG,
  DELETE_TAG,
  CHANGE_TAG_COLOR,
} from '../constants/ActionTypes'

export function addTag() {
  return { type: ADD_TAG }
}

export function addTagWithValues(title, color) {
  return { type: ADD_TAG_WITH_VALUES, title, color }
}

export function addCreatedTag(attributes) {
  return { type: ADD_CREATED_TAG, attributes }
}

export function editTag(id, title, color, categoryId) {
  return { type: EDIT_TAG, id, title, color, categoryId }
}

export function changeColor(id, color) {
  return { type: CHANGE_TAG_COLOR, id, color }
}

export function deleteTag(id) {
  return { type: DELETE_TAG, id }
}

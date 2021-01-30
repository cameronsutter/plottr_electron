import { ADD_TAG, ADD_CREATED_TAG, EDIT_TAG, DELETE_TAG } from 'constants/ActionTypes'

export function addTag() {
  return { type: ADD_TAG }
}

export function addCreatedTag(attributes) {
  return { type: ADD_CREATED_TAG, attributes }
}

export function editTag(id, title, color) {
  return { type: EDIT_TAG, id, title, color }
}

export function deleteTag(id) {
  return { type: DELETE_TAG, id }
}

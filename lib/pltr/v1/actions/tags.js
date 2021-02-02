import { ADD_TAG, EDIT_TAG, DELETE_TAG } from '../constants/ActionTypes'
import { tag } from '../store/initialState'

export function addTag() {
  return { type: ADD_TAG, title: tag.title }
}

export function editTag(id, title, color) {
  return { type: EDIT_TAG, id, title, color }
}

export function deleteTag(id) {
  return { type: DELETE_TAG, id }
}

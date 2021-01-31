import {
  ADD_TAG,
  ADD_TAG_WITH_VALUES,
  EDIT_TAG,
  DELETE_TAG,
  CHANGE_TAG_COLOR,
} from '../constants/ActionTypes'
import { tag } from '../store/initialState'

export function addTag() {
  return { type: ADD_TAG, title: tag.title }
}

export function addTagWithValues(title, color) {
  return { type: ADD_TAG_WITH_VALUES, title, color }
}

export function editTag(id, title, color) {
  return { type: EDIT_TAG, id, title, color }
}

export function changeColor(id, color) {
  return { type: CHANGE_TAG_COLOR, id, color }
}

export function deleteTag(id) {
  return { type: DELETE_TAG, id }
}

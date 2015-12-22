import { ADD_TAG, EDIT_TAG_TITLE } from 'constants/ActionTypes'
import { tag } from 'store/initialState'

export function addTag () {
  return { type: ADD_TAG, title: tag.title }
}

export function editTagTitle (id, title) {
  return { type: EDIT_TAG_TITLE, id, title }
}

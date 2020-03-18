import { ADD_BOOK, EDIT_BOOK, DELETE_BOOK, REORDER_BOOKS } from 'constants/ActionTypes'

export function editBook (id, attributes) {
  return { type: EDIT_BOOK, id, attributes }
}
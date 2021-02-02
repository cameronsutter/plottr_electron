import { ADD_BOOK, EDIT_BOOK, DELETE_BOOK, REORDER_BOOKS } from '../constants/ActionTypes'
import { book } from '../store/initialState'

export function addBook() {
  return { type: ADD_BOOK, book }
}

export function editBook(id, attributes) {
  return { type: EDIT_BOOK, id, attributes }
}

export function deleteBook(id) {
  return { type: DELETE_BOOK, id }
}

export function reorderBooks(ids) {
  return { type: REORDER_BOOKS, ids }
}

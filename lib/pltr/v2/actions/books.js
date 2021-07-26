import {
  ADD_BOOK,
  EDIT_BOOK,
  DELETE_BOOK,
  REORDER_BOOKS,
  LOAD_BOOKS,
  ADD_BOOK_FROM_TEMPLATE,
} from '../constants/ActionTypes'
import { book } from '../store/initialState'

export function addBook() {
  return { type: ADD_BOOK, book }
}

export function addBookFromTemplate(templateData) {
  return { type: ADD_BOOK_FROM_TEMPLATE, book, templateData }
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

export function load(patching, books) {
  return { type: LOAD_BOOKS, patching, books }
}

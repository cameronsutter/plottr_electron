import {
  ADD_BOOK,
  EDIT_BOOK,
  DELETE_BOOK,
  REORDER_BOOKS,
  LOAD_BOOKS,
  ADD_BOOK_FROM_TEMPLATE,
  EDIT_BOOK_IMAGE,
} from '../constants/ActionTypes'
import { book } from '../store/initialState'

export function addBook(title, premise, genre, theme) {
  return { type: ADD_BOOK, book, title, premise, genre, theme }
}

export function addBookFromTemplate(templateData) {
  return { type: ADD_BOOK_FROM_TEMPLATE, book, templateData }
}

//  Breaking Changes
//  2022-23-11
export function editBook(id, title, premise, genre, theme) {
  return { type: EDIT_BOOK, id, title, premise, genre, theme }
}

export function editBookImage(id, imageId) {
  return { type: EDIT_BOOK_IMAGE, id, imageId }
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

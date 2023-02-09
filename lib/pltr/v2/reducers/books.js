import { mapValues } from 'lodash'
import {
  FILE_LOADED,
  NEW_FILE,
  RESET,
  EDIT_BOOK,
  ADD_BOOK,
  DELETE_BOOK,
  REORDER_BOOKS,
  ADD_LINES_FROM_TEMPLATE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  LOAD_BOOKS,
  ADD_BOOK_FROM_TEMPLATE,
  DELETE_IMAGE,
  EDIT_BOOK_IMAGE,
} from '../constants/ActionTypes'
import { isSeries } from '../helpers/books'
import { book as defaultBook } from '../store/initialState'
import { newFileBooks } from '../store/newFileState'

const initialState = {
  allIds: [1],
  1: defaultBook,
}

const books =
  (dataRepairers) =>
  (state = initialState, action) => {
    switch (action.type) {
      case EDIT_BOOK:
        return {
          ...state,
          [action.id]: {
            ...state[action.id],
            title: action.title,
            premise: action.premise,
            genre: action.genre,
            theme: action.theme,
          },
        }

      case EDIT_BOOK_IMAGE:
        return {
          ...state,
          [action.id]: {
            ...state[action.id],
            imageId: action.imageId,
          },
        }

      case ADD_BOOK_FROM_TEMPLATE:
      case ADD_BOOK: {
        return {
          ...state,
          allIds: [...state.allIds, action.newBookId],
          [action.newBookId]: {
            ...action.book,
            id: action.newBookId,
            title: action.title,
            premise: action.premise,
            genre: action.genre,
            theme: action.theme,
            timelineTemplates: action.templateData ? [action.templateData.id] : [],
          },
        }
      }

      case REORDER_BOOKS:
        return {
          ...state,
          allIds: action.ids,
        }

      case DELETE_BOOK: {
        const newIds = [...state.allIds]
        newIds.splice(newIds.indexOf(action.id), 1)
        return state.allIds.reduce(
          (acc, id) => {
            if (id != action.id) {
              acc[id] = state[id]
            }
            return acc
          },
          { allIds: newIds }
        )
      }

      case ADD_LINES_FROM_TEMPLATE:
        if (isSeries(action.bookId)) return state
        return {
          ...state,
          [action.bookId]: {
            ...state[action.bookId],
            timelineTemplates: [...state[action.bookId].timelineTemplates, action.templateData.id],
          },
        }

      case CLEAR_TEMPLATE_FROM_TIMELINE:
        return {
          ...state,
          [action.bookId]: {
            ...state[action.bookId],
            timelineTemplates: state[action.bookId].timelineTemplates.filter(
              (tt) => tt.id != action.templateId
            ),
          },
        }

      case DELETE_IMAGE:
        return mapValues(state, (value, key) => {
          if (
            !Array.isArray(value) &&
            value instanceof Object &&
            value.imageId &&
            value.imageId == action.id
          ) {
            return {
              ...value,
              imageId: null,
            }
          }
          return value
        })

      case RESET:
      case FILE_LOADED:
        return action.data.books

      case NEW_FILE:
        return newFileBooks

      case LOAD_BOOKS:
        return action.books

      default:
        return state
    }
  }

export default books

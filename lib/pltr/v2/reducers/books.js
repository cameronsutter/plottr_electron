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
} from '../constants/ActionTypes'
import { book as defaultBook } from '../store/initialState'
import { newFileBooks } from '../store/newFileState'
import { objectId } from '../store/newIds'

const initialState = {
  allIds: [1],
  1: defaultBook,
}

export default function books(state = initialState, action) {
  switch (action.type) {
    case EDIT_BOOK:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.attributes,
        },
      }

    case ADD_BOOK:
      const newId = objectId(state.allIds)
      return {
        ...state,
        allIds: [...state.allIds, newId],
        [newId]: {
          ...action.book,
          id: newId,
        },
      }

    case REORDER_BOOKS:
      return {
        ...state,
        allIds: action.ids,
      }

    case DELETE_BOOK:
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

    case ADD_LINES_FROM_TEMPLATE:
      return {
        ...state,
        [action.bookId]: {
          ...state[action.bookId],
          timelineTemplates: [
            ...state[action.bookId].timelineTemplates,
            { id: action.template.id, name: action.template.name },
          ],
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

    case RESET:
    case FILE_LOADED:
      return action.data.books

    case NEW_FILE:
      return newFileBooks

    default:
      return state
  }
}

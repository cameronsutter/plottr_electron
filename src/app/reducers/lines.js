import { partition } from 'lodash'
import { ADD_LINE, ADD_LINES_FROM_TEMPLATE, EDIT_LINE_TITLE, EXPAND_LINE, COLLAPSE_LINE, EXPAND_TIMELINE, COLLAPSE_TIMELINE,
  EDIT_LINE_COLOR, REORDER_LINES, DELETE_LINE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { line } from '../../../shared/initialState'
import { newFileLines } from '../../../shared/newFileState'
import { nextId } from 'store/newIds'
import { nextColor } from 'store/lineColors'
import { nextPositionInBook, positionReset } from '../helpers/lists'

const initialState = [line]

export default function lines (state = initialState, action) {
  switch (action.type) {
    case ADD_LINE:
      const linesInBook = state.filter(l => l.bookId == action.bookId).length
      return [{
        id: nextId(state),
        bookId: action.bookId,
        title: '',
        color: nextColor(linesInBook),
        position: nextPositionInBook(state, action.bookId),
        expanded: null,
      }, ...state]

    case ADD_LINES_FROM_TEMPLATE:
      const [book, notBook] = partition(state, l => l.bookId == action.bookId)
      return [...notBook, ...action.lines]

    case EDIT_LINE_TITLE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {title: action.title}) : l
      )

    case EDIT_LINE_COLOR:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {color: action.color}) : l
      )

    case DELETE_LINE:
      return state.filter(l =>
        l.id !== action.id
      )

    case REORDER_LINES:
      return [
        ...state.filter(l => l && l.bookId != action.bookId),
        ...positionReset(action.lines),
      ]

    case EXPAND_LINE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {expanded: true}) : l
      )

    case COLLAPSE_LINE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {expanded: false}) : l
      )

    case COLLAPSE_TIMELINE:
    case EXPAND_TIMELINE:
      return state.map(l => Object.assign({}, l, {expanded: null}) )

    case RESET:
    case FILE_LOADED:
      return action.data.lines

    case NEW_FILE:
      return newFileLines

    default:
      return state
  }
}

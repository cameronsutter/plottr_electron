import { ADD_LINE, ADD_LINES_FROM_TEMPLATE, EDIT_LINE_TITLE,
  EDIT_LINE_COLOR, REORDER_LINES, DELETE_LINE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { line } from '../../../shared/initialState'
import { newFileLines } from '../../../shared/newFileState'
import { nextId } from 'store/newIds'
import { nextColor } from 'store/lineColors'
import { nextPositionInBook, nextPosition, positionReset } from '../helpers/lists'

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
        position: nextPositionInBook(state, action.bookId)
      }, ...state]

    case ADD_LINES_FROM_TEMPLATE:
      const position = nextPosition(state)
      const length = state.filter(l => l.bookId == action.bookId).length
      return [...action.lines.map((l, idx) => {
        return {
          id: l.id,
          title: l.title,
          bookId: action.bookId,
          color: nextColor(length + idx),
          position: position + idx,
        }
      }), ...state]

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
        ...state.filter(l => l.bookId != action.bookId),
        ...positionReset(action.lines),
      ]

    case RESET:
    case FILE_LOADED:
      return action.data.lines

    case NEW_FILE:
      return newFileLines

    default:
      return state
  }
}

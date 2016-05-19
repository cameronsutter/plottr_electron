import { ADD_LINE, EDIT_LINE_TITLE, EDIT_LINE_COLOR, REORDER_LINES, DELETE_LINE, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { line } from 'store/initialState'
import { lineId, linePosition } from 'store/newIds'

const initialState = [line]

export default function lines (state = initialState, action) {
  switch (action.type) {
    case ADD_LINE:
      return [{
        id: lineId(state),
        title: action.title,
        color: action.color,
        position: linePosition(state)
      }, ...state]

    case EDIT_LINE_TITLE:
      return state.map(line =>
        line.id === action.id ? Object.assign({}, line, {title: action.title}) : line
      )

    case EDIT_LINE_COLOR:
      return state.map(line =>
        line.id === action.id ? Object.assign({}, line, {color: action.color}) : line
      )

    case DELETE_LINE:
      return state.filter(line =>
        line.id !== action.id
      )

    case REORDER_LINES:
      return action.lines

    case FILE_LOADED:
      return action.data.lines

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}

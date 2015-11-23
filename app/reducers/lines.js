import { ADD_LINE, EDIT_LINE_TITLE, EDIT_LINE_COLOR, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { line } from 'store/initialState'

const initialState = [line]

export default function lines (state = initialState, action) {
  switch (action.type) {
    case ADD_LINE:
      return [{
        id: state.reduce((maxId, line) => Math.max(line.id, maxId), -1) + 1,
        title: action.title,
        color: action.color,
        position: state.reduce((maxPosition, line) => Math.max(line.position, maxPosition), -1) + 1
      }, ...state]

    case EDIT_LINE_TITLE:
      return state.map(line =>
        line.id === action.id ? Object.assign({}, line, {title: action.title}) : line
      )

    case EDIT_LINE_COLOR:
      return state.map(line =>
        line.id === action.id ? Object.assign({}, line, {color: action.color}) : line
      )

    case FILE_LOADED:
      return action.data.lines

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}

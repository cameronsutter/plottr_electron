import { ADD_PLACE, EDIT_LINE_TITLE, EDIT_LINE_COLOR, FILE_LOADED } from '../constants/ActionTypes'

const initialState = [{
  id: 0,
  color: '#000000',
  title: 'Character Name',
  position: 0
}]

export default function lines (state = initialState, action) {
  switch (action.type) {
    case ADD_PLACE:
      return [{
        id: state.reduce((maxId, line) => Math.max(line.id, maxId), -1) + 1,
        title: action.title,
        color: action.color
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

    default:
      return state
  }
}

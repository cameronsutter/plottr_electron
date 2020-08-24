import { ADD_SERIES_LINE, ADD_SERIES_LINES_FROM_TEMPLATE, EDIT_SERIES_LINE_TITLE,
  EXPAND_SERIES_LINE, COLLAPSE_SERIES_LINE, EXPAND_TIMELINE, COLLAPSE_TIMELINE,
  EDIT_SERIES_LINE_COLOR, REORDER_SERIES_LINES, DELETE_SERIES_LINE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { seriesLine } from '../store/initialState'
import { newFileSeriesLines } from '../../../shared/newFileState'
import { nextId } from 'store/newIds'
import { nextColor } from 'store/lineColors'
import { nextPosition, positionReset } from 'helpers/lists'

const initialState = [seriesLine]

export default function seriesLines (state = initialState, action) {
  switch (action.type) {
    case ADD_SERIES_LINE:
      return [{
        id: nextId(state),
        title: '',
        color: nextColor(state.length),
        position: nextPosition(state),
        expanded: null,
      }, ...state]

    case ADD_SERIES_LINES_FROM_TEMPLATE:
      const position = nextPosition(state)
      return [...action.lines.map((l, idx) => {
        return {
          id: l.id,
          title: l.title,
          color: nextColor(state.length + idx),
          position: position + idx,
        }
      }), ...state]

    case EDIT_SERIES_LINE_TITLE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {title: action.title}) : l
      )

    case EDIT_SERIES_LINE_COLOR:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {color: action.color}) : l
      )

    case DELETE_SERIES_LINE:
      return state.filter(l =>
        l.id !== action.id
      )

    case REORDER_SERIES_LINES:
      return positionReset(action.lines)


    case EXPAND_SERIES_LINE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {expanded: true}) : l
      )

    case COLLAPSE_SERIES_LINE:
      return state.map(l =>
        l.id === action.id ? Object.assign({}, l, {expanded: false}) : l
      )

    case COLLAPSE_TIMELINE:
    case EXPAND_TIMELINE:
      return state.map(l => Object.assign({}, l, {expanded: null}) )

    case RESET:
    case FILE_LOADED:
      return action.data.seriesLines

    case NEW_FILE:
      return newFileSeriesLines

    default:
      return state
  }
}

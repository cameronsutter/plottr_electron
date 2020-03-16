import { ADD_LINE, ADD_LINES_FROM_TEMPLATE, EDIT_LINE_TITLE,
  EDIT_LINE_COLOR, REORDER_LINES, DELETE_LINE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { seriesLine } from '../../../shared/initialState'
import { newFileSeriesLines } from '../../../shared/newFileState'
import { arrayId, arrayPosition, arrayPositionReset } from 'store/newIds'
import { nextColor } from 'store/lineColors'

const initialState = [seriesLine]

export default function seriesLines (state = initialState, action) {
  switch (action.type) {
    case ADD_LINE:
      return [{
        id: arrayId(state),
        title: seriesLine.title,
        color: nextColor(state.length),
        position: arrayPosition(state)
      }, ...state]

    case ADD_LINES_FROM_TEMPLATE:
      const nextPosition = arrayPosition(state)
      return [...action.lines.map((l, idx) => {
        return {
          id: l.id,
          title: l.title,
          color: nextColor(state.length + idx),
          position: nextPosition + idx,
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
      return arrayPositionReset(action.lines)

    case RESET:
    case FILE_LOADED:
      return action.data.seriesLines

    case NEW_FILE:
      return newFileSeriesLines

    default:
      return state
  }
}

import { ADD_BEAT, EDIT_BEAT_TITLE, REORDER_BEATS, DELETE_BEAT, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { beat as defaultBeat } from '../../../shared/initialState'
import { newFileBeats } from '../../../shared/newFileState'
import { nextId } from '../store/newIds'
import { nextPosition, positionReset } from '../helpers/lists'

export default function beats (state = defaultBeat, action) {
  switch (action.type) {
    case ADD_BEAT:
      return [{
        id: nextId(state),
        title: action.title,
        time: 0,
        position: nextPosition(state)
      }, ...state]

    case EDIT_BEAT_TITLE:
      return state.map(b =>
        b.id == action.id ? Object.assign({}, b, {title: action.title}) : b
      )

    case DELETE_BEAT:
      return state.filter(b => b.id != action.id)

    case REORDER_BEATS:
      return positionReset(action.beats)

    case RESET:
    case FILE_LOADED:
      return action.data.beats

    case NEW_FILE:
      return newFileBeats

    default:
      return state
  }
}
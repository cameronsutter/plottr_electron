import { FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { beat as defaultBeat } from '../../../shared/initialState'
import { newFileBeats } from '../../../shared/newFileState'

export default function beats (state = defaultBeat, action) {
  switch (action.type) {

    case RESET:
    case FILE_LOADED:
      return action.data.beats

    case NEW_FILE:
      return newFileBeats

    default:
      return state
  }
}
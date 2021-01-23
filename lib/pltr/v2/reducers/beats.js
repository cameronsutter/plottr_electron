import {
  ADD_BEAT,
  EDIT_BEAT_TITLE,
  REORDER_BEATS,
  DELETE_BEAT,
  RESET_TIMELINE,
  REORDER_CARDS_IN_CHAPTER,
  AUTO_SORT_BEAT,
  FILE_LOADED,
  NEW_FILE,
  RESET,
} from '../constants/ActionTypes'
import { beat as defaultBeat } from '../store/initialState'
import { newFileBeats } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { nextPosition, positionReset } from '../helpers/lists'

export default function beats(state = defaultBeat, action) {
  switch (action.type) {
    case ADD_BEAT:
      return [
        {
          id: nextId(state),
          title: action.title,
          time: 0,
          position: nextPosition(state),
          autoOutlineSort: true,
        },
        ...state,
      ]

    case EDIT_BEAT_TITLE:
      return state.map((b) =>
        b.id == action.id ? Object.assign({}, b, { title: action.title }) : b
      )

    case DELETE_BEAT:
      return state.filter((b) => b.id != action.id)

    case REORDER_BEATS:
      return positionReset(action.beats)

    case REORDER_CARDS_IN_CHAPTER:
      return state.map((b) =>
        b.id == action.chapterId && action.isSeries
          ? Object.assign({}, b, { autoOutlineSort: false })
          : b
      )

    case AUTO_SORT_BEAT:
      return state.map((b) =>
        b.id == action.id ? Object.assign({}, b, { autoOutlineSort: true }) : b
      )

    case RESET_TIMELINE:
      if (!action.isSeries) return state

      return [
        {
          id: nextId(state),
          title: 'auto',
          time: 0,
          position: 0,
          autoOutlineSort: true,
        },
      ]

    case RESET:
    case FILE_LOADED:
      return action.data.beats

    case NEW_FILE:
      return newFileBeats

    default:
      return state
  }
}

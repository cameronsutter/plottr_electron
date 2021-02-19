import {
  ADD_HIERARCHY_LEVEL,
  DELETE_HIERARCHY_LEVEL,
  ASSIGN_BEAT_TO_HIERARCHY,
} from '../constants/ActionTypes'
import { newFileTimelines } from '../store/newFileState'

const INITIAL_STATE = newFileTimelines

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_HIERARCHY_LEVEL: {
      if (!state[action.bookId]) return state

      // Write a test for an empty hierarchy
      // if (!state[action.bookId].hierarchy.length) return state

      const newLevel = state[action.bookId].hierarchy[0].level + 1
      return {
        ...state,
        [action.bookId]: {
          ...state[action.bookId],
          hierarchy: [
            {
              level: newLevel,
              beatId: action.beatId,
              children: state[action.bookId].hierarchy,
            },
          ],
        },
      }
    }
    case DELETE_HIERARCHY_LEVEL: {
      return {
        ...state,
        [action.bookId]: {
          ...state[action.bookId],
          hierarchy: state[action.bookId].hierarchy.flatMap((node) => node.children),
        },
      }
    }
    case ASSIGN_BEAT_TO_HIERARCHY:
    default:
      return state
  }
}

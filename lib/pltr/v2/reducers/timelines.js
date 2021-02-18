import {
  ADD_HIERARCHY_LEVEL,
  DELETE_HIERARCHY_LEVEL,
  ASSIGN_BEAT_TO_HIERARCHY,
} from '../constants/ActionTypes'

const INITIAL_STATE = {}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_HIERARCHY_LEVEL:
    case DELETE_HIERARCHY_LEVEL:
    case ASSIGN_BEAT_TO_HIERARCHY:
    default:
      return state
  }
}

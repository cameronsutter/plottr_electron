import { EDIT_HIERARCHY_LEVELS } from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'

const INITIAL_STATE = newFileHierarchies

export default function hierarchy(state = INITIAL_STATE, action) {
  switch (action.type) {
    case EDIT_HIERARCHY_LEVELS:
      return {
        ...state,
        hierarchyLevels: action.hierarchyLevels,
      }
    default:
      return state
  }
}

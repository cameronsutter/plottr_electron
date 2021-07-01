import {
  EDIT_HIERARCHY_LEVEL,
  LOAD_HIERARCHY,
  SET_HIERARCHY_LEVELS,
} from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'
import { FILE_LOADED, NEW_FILE, RESET } from '../../v1/constants/ActionTypes'

const INITIAL_STATE = newFileHierarchies

const hierarchy =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SET_HIERARCHY_LEVELS: {
        return action.hierarchyLevels.reduce(
          (acc, next, index) => ({
            ...acc,
            [index]: {
              ...next,
              level: index,
            },
          }),
          {}
        )
      }

      case EDIT_HIERARCHY_LEVEL:
        return {
          ...state,
          [action.hierarchyLevel.level]: {
            ...state[action.hierarchyLevel.level],
            ...action.hierarchyLevel,
          },
        }

      case RESET:
      case FILE_LOADED:
        return action.data.hierarchyLevels || INITIAL_STATE

      case NEW_FILE:
        return INITIAL_STATE

      case LOAD_HIERARCHY:
        return action.hierarchy

      default:
        return state
    }
  }

export default hierarchy

import { EDIT_HIERARCHY_LEVEL, SET_HIERARCHY_LEVELS } from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'
import { FILE_LOADED, NEW_FILE, RESET } from '../../v1/constants/ActionTypes'

const INITIAL_STATE = newFileHierarchies

export default function hierarchy(state = INITIAL_STATE, action) {
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
      return action.data.hierarchyLevels

    case NEW_FILE:
      return INITIAL_STATE

    default:
      return state
  }
}

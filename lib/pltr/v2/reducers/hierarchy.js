import {
  EDIT_HIERARCHY_LEVEL,
  SET_HIERARCHY_LEVELS,
  SET_LEVELS_OF_HIERARCHY,
} from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'
import { hierarchyLevel } from '../store/initialState'
import { clone, times } from 'lodash'
import { FILE_LOADED, NEW_FILE, RESET } from '../../v1/constants/ActionTypes'

const INITIAL_STATE = newFileHierarchies

export default function hierarchy(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_LEVELS_OF_HIERARCHY: {
      const currentLength = Object.keys(state).length
      const { levelsOfHierarchy } = action
      if (currentLength === levelsOfHierarchy) return state

      const hierarchyLevels = Object.values(state)
      const toTrim = Math.max(hierarchyLevels.length - levelsOfHierarchy, 0)
      const toAdd = Math.max(levelsOfHierarchy - hierarchyLevels.length)
      const trimmed = hierarchyLevels.slice(toTrim)
      trimmed.forEach((hierarchyLevel) => {
        hierarchyLevel.level += toAdd
      })
      const newLevels = times(toAdd, (i) => {
        return {
          ...clone(hierarchyLevel),
          level: i,
        }
      })
      const withNewLevels = newLevels.concat(trimmed)

      return withNewLevels.reduce((newState, hierarchyLevel) => {
        return {
          ...newState,
          [hierarchyLevel.level]: hierarchyLevel,
        }
      }, {})
    }

    case SET_HIERARCHY_LEVELS: {
      return action.hierarchyLevels.reduce(
        (acc, next) => ({
          ...acc,
          [next.level]: next,
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

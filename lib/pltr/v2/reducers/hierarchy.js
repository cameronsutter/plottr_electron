import { SET_HIERARCHY_LEVELS, SET_LEVELS_OF_HIERARCHY } from '../constants/ActionTypes'
import { newFileHierarchies } from '../store/newFileState'
import { hierarchyLevel } from '../store/initialState'
import { clone } from 'lodash'

const INITIAL_STATE = newFileHierarchies

export default function hierarchy(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_LEVELS_OF_HIERARCHY: {
      const currentLength = Object.keys(state).length
      if (currentLength === action.levelsOfhierarchy) return state

      const newHierarchyLevels = clone(state)
      if (currentLength > action.levelsOfHierarchy) {
        for (let i = currentLength - 1; i > action.levelsOfHierarchy; --i) {
          delete newHierarchyLevels[i]
        }
      } else {
        for (let i = currentLength; i < action.levelsOfHierarchy; ++i) {
          const newLevel = clone(hierarchyLevel)
          newLevel.level = i
          newHierarchyLevels[i] = newLevel
        }
      }
      return newHierarchyLevels
    }
    case SET_HIERARCHY_LEVELS: {
      return action.hierarchyLevels
    }
    default:
      return state
  }
}

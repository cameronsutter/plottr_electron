import { SET_LEVELS_OF_HIERARCHY, SET_HIERARCHY_LEVELS } from '../constants/ActionTypes'

export const setLevelsOfHierarchy = (newLevels) => ({
  type: SET_LEVELS_OF_HIERARCHY,
  levelsOfHierarchy: newLevels,
})

export const setHierarchyLevels = (newHierarchyLevels) => ({
  type: SET_HIERARCHY_LEVELS,
  hierarchyLevels: newHierarchyLevels,
})

import { SET_HIERARCHY_LEVELS, EDIT_HIERARCHY_LEVEL } from '../constants/ActionTypes'

export const setHierarchyLevels = (newHierarchyLevels) => ({
  type: SET_HIERARCHY_LEVELS,
  hierarchyLevels: newHierarchyLevels,
})

export const editHierarchyLevel = (hierarchyLevel) => ({
  type: EDIT_HIERARCHY_LEVEL,
  hierarchyLevel,
})

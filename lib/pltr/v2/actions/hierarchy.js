import { EDIT_HIERARCHY_LEVELS } from '../constants/ActionTypes'

export const editHierarchyLevels = (newLevels) => ({
  type: EDIT_HIERARCHY_LEVELS,
  hierarchyLevels: newLevels,
})

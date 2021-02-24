import { createSelector } from 'reselect'

export const hierarchyLevels = (state) => state.hierarchyLevels

export const sortedHierarchyLevels = createSelector(hierarchyLevels, (hierarchyLevels) => {
  return Object.values(hierarchyLevels)
    .filter((value) => typeof value === 'object')
    .sort((thisLevel, thatLevel) => thisLevel.level - thatLevel.level)
})

export const hierarchyLevelCount = createSelector(
  hierarchyLevels,
  ({ hierarchyLevels }) => hierarchyLevels
)

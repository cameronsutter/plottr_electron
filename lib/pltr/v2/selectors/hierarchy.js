import { createSelector } from 'reselect'

export const hierarchyLevels = (state) => state.hierarchyLevels

export const hierarchyLevelCount = createSelector(
  hierarchyLevels,
  (hierarchyLevels) => Object.keys(hierarchyLevels).length
)

export const sortedHierarchyLevels = createSelector(
  hierarchyLevelCount,
  hierarchyLevels,
  (levels, hierarchyLevels) => {
    const sortedLevels = []
    for (let i = levels - 1; i >= 0; --i) {
      sortedLevels.push(hierarchyLevels[i])
    }
    return sortedLevels
  }
)

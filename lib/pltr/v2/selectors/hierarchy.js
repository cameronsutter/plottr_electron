import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'

const levels = (state) => state.hierarchyLevels

export const hierarchyLevels = createSelector(
  levels,
  currentTimelineSelector,
  (allLevels, timeline) => {
    return allLevels[timeline]
  }
)

export const hierarchyLevelCount = createSelector(
  hierarchyLevels,
  (hierarchyLevels) => Object.keys(hierarchyLevels).length
)

export const sortedHierarchyLevels = createSelector(
  hierarchyLevelCount,
  hierarchyLevels,
  (levels, hierarchyLevels) => {
    const sortedLevels = []
    for (let i = 0; i < levels; ++i) {
      sortedLevels.push(hierarchyLevels[i])
    }
    return sortedLevels
  }
)

export const topLevelBeatNameSelector = createSelector(sortedHierarchyLevels, (levels) => {
  return levels[0].name
})

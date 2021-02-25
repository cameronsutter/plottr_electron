import { createSelector } from 'reselect'
import { depth } from '../reducers/tree'

import { beatIdSelector, beatsByBookSelector } from './beats'

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

export const hierarchyLevelSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1]
  }
)

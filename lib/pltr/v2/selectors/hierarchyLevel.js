import { createSelector } from 'reselect'
import { repeat } from 'lodash'

import { depth } from '../reducers/tree'
import { beatIdSelector, beatsByBookSelector } from './beats'
import { sortedHierarchyLevels } from './hierarchy'

export const hierarchyLevelSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1]
  }
)

export const atMaximumHierarchyDepthSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return depth(beats, beatId) === hierarchyLevels.length - 1
  }
)

export const hierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    if (!beatId) return hierarchyLevels[0].name
    return (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
      .name
  }
)

export const hierarchyChildLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    if (!beatId) return (hierarchyLevels[1] || hierarchyLevels[0]).name
    const newDepth = depth(beats, beatId) + 1
    const level = hierarchyLevels[newDepth]
    if (level) {
      return level.name
    } else {
      return `${repeat('Sub-', newDepth - hierarchyLevels.length + 1)}${
        hierarchyLevels[hierarchyLevels.length - 1].name
      }`
    }
  }
)

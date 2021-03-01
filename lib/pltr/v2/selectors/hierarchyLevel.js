import { createSelector } from 'reselect'
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

export const hierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
      .name
  }
)

export const hierarchyChildLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return (
      hierarchyLevels[depth(beats, beatId) + 1] || hierarchyLevels[hierarchyLevels.length - 1]
    ).name
  }
)

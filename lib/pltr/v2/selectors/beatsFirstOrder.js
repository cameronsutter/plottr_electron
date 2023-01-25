// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { maxDepth, nextId, beatsByPosition, rootParentId } from '../helpers/beats'
import { children, depth } from '../reducers/tree'

export const allBeatsSelector = (state) => state.beats
export const beatIdSelector = (state, beatId) => beatId

export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

const bookIdSelector = (state, bookId) => bookId
export const beatsForAnotherBookSelector = createSelector(
  bookIdSelector,
  allBeatsSelector,
  (bookId, beats) => {
    return beats[bookId]
  }
)

export const beatsForBookOne = createSelector(allBeatsSelector, (beats) => {
  return beats[1]
})

export const visibleBeatsByPositionForTimeline = (
  beats,
  beatHierarchyIsOn,
  timelineViewIsTabbed,
  activeTab,
  timelineViewIsStacked,
  timelineViewIsSmall
) => {
  const activeParentId = activeTab
  return visibleBeatsForTopLevelParentByPosition(
    beats,
    beatHierarchyIsOn,
    timelineViewIsTabbed,
    activeParentId,
    timelineViewIsStacked,
    timelineViewIsSmall
  )
}

export const visibleBeatsForTopLevelParentByPosition = (
  beats,
  beatHierarchyIsOn,
  timelineViewIsTabbed,
  topLevelParentId,
  timelineViewIsStacked,
  timelineViewIsSmall
) => {
  const maximumDepth = maxDepth(beats)

  return beatsByPosition(({ id, expanded }) => {
    return expanded || !beatHierarchyIsOn || timelineViewIsTabbed || timelineViewIsStacked
  })(beats)
    .filter(({ id }) => {
      const nodeChildren = children(beats, id)
      const currentDepth = depth(beats, id)
      const rootParentNodeId = rootParentId(beats, id)
      const beatIsVisible = beatHierarchyIsOn || currentDepth === maximumDepth
      return (
        (timelineViewIsTabbed &&
          rootParentNodeId === topLevelParentId &&
          currentDepth !== 0 &&
          beatIsVisible) ||
        (timelineViewIsStacked &&
          (timelineViewIsSmall || nodeChildren.length === 0) &&
          beatIsVisible) ||
        (!timelineViewIsTabbed && !timelineViewIsStacked && beatIsVisible)
      )
    })
    .map((beat) => {
      const currentDepth = depth(beats, beat.id)
      if (!timelineViewIsSmall && timelineViewIsStacked && currentDepth !== maximumDepth) {
        return {
          ...beat,
          isInsertChildCell: true,
        }
      }
      return beat
    })
}

export const visibleBeatsByPositionIgnoringCollapsed = (beats, beatHierarchyIsOn) =>
  beatsByPosition(() => {
    return true
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    return beatHierarchyIsOn || currentDepth === maximumDepth
  })

export const sortedBeatsForAnotherBookSelector = createSelector(
  beatsForAnotherBookSelector,
  beatsByPosition(() => true)
)

export const templateBeatsForBookOne = createSelector(
  beatsForBookOne,
  beatsByPosition(() => true)
)

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
  timelineViewIsTabbed,
  activeTab,
  timelineViewIsStacked,
  timelineViewIsSmall
) => {
  const activeParentId = activeTab
  return visibleBeatsForTopLevelParentByPosition(
    beats,
    timelineViewIsTabbed,
    activeParentId,
    timelineViewIsStacked,
    timelineViewIsSmall
  )
}

export const visibleBeatsForTopLevelParentByPosition = (
  beats,
  timelineViewIsTabbed,
  topLevelParentId,
  timelineViewIsStacked,
  timelineViewIsSmall
) => {
  const maximumDepth = maxDepth(beats)

  return beatsByPosition(({ id, expanded }) => {
    return expanded || timelineViewIsTabbed || timelineViewIsStacked
  })(beats)
    .filter(({ id }) => {
      const nodeChildren = children(beats, id)
      const currentDepth = depth(beats, id)
      const rootParentNodeId = rootParentId(beats, id)
      return (
        (timelineViewIsTabbed && rootParentNodeId === topLevelParentId && currentDepth !== 0) ||
        (timelineViewIsStacked && (timelineViewIsSmall || nodeChildren.length === 0)) ||
        (!timelineViewIsTabbed && !timelineViewIsStacked)
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

export const visibleBeatsByPositionIgnoringCollapsed = (beats) =>
  beatsByPosition(() => {
    return true
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    return currentDepth === maximumDepth
  })

export const sortedBeatsForAnotherBookSelector = createSelector(
  beatsForAnotherBookSelector,
  beatsByPosition(() => true)
)

export const templateBeatsForBookOne = createSelector(
  beatsForBookOne,
  beatsByPosition(() => true)
)

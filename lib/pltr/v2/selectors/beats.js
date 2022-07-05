import { createSelector } from 'reselect'
import {
  currentTimelineSelector,
  isSeriesSelector,
  timelineActiveTabSelector,
  timelineViewIsTabbedSelector,
} from './ui'
import {
  maxDepth,
  nextId,
  beatsByPosition,
  numberOfPriorChildrenAtSameDepth,
  beatTitle,
  beatOneIsPrologue,
  rootParentId
} from '../helpers/beats'
import { findNode, children, depth, reduce } from '../reducers/tree'
import { sortedHierarchyLevels } from './hierarchy'
import { beatHierarchyIsOn } from './featureFlags'
export const bookIdSelector = (state, bookId) => bookId

export const allBeatsSelector = (state) => state.beats
export const beatIdSelector = (state, beatId) => beatId

export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats[bookId]
  }
)

export const beatsForAnotherBookSelector = createSelector(
  bookIdSelector,
  allBeatsSelector,
  (bookId, beats) => {
    return beats[bookId]
  }
)

export const firstVisibleBeatForBookSelector = createSelector(
  allBeatsSelector,
  bookIdSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  (beats, bookId, beatHierarchyIsOn) => {
    const firstVisibleBeat = visibleBeatsByPosition(
      beats[bookId],
      beatHierarchyIsOn,
      timelineViewIsTabbedSelector
    )[0]
    return firstVisibleBeat
  }
)

export const beatsForBookOne = createSelector(allBeatsSelector, (beats) => {
  return beats[1]
})

const visibleBeatsByPosition = (beats, beatHierarchyIsOn, timelineViewIsTabbed) =>
  beatsByPosition(({ expanded }) => {
    return expanded || !beatHierarchyIsOn
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    const beatIsVisible = beatHierarchyIsOn || currentDepth === maximumDepth
    return (
      (timelineViewIsTabbed && currentDepth !== 0 && beatIsVisible) ||
      (!timelineViewIsTabbed && beatIsVisible)
    )
  })

const visibleBeatsByPositionForTimeline = (
  beats,
  beatHierarchyIsOn,
  timelineViewIsTabbed,
  activeTab
) => {
  const activeParentId = topLevelVisibleBeatsByPosition(beats, beatHierarchyIsOn)[activeTab].id
  return visibleBeatsForTopLevelParentByPosition(
    beats,
    beatHierarchyIsOn,
    timelineViewIsTabbed,
    activeParentId
  )
}

const topLevelVisibleBeatsByPosition = (beats, beatHierarchyIsOn) =>
  beatsByPosition(({ expanded, id }) => {
    const currentDepth = depth(beats, id)
    return currentDepth === 0 && (expanded || !beatHierarchyIsOn)
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    const beatIsVisible = beatHierarchyIsOn || currentDepth === maximumDepth
    return currentDepth === 0 && beatIsVisible
  })

const visibleBeatsForTopLevelParentByPosition = (
  beats,
  beatHierarchyIsOn,
  timelineViewIsTabbed,
  topLevelParentId
) =>
  beatsByPosition(({ id, expanded }) => {
    return expanded || !beatHierarchyIsOn
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    const rootParentNodeId = rootParentId(beats, id)
    const beatIsVisible = beatHierarchyIsOn || currentDepth === maximumDepth
    return (
      (timelineViewIsTabbed &&
        rootParentNodeId === topLevelParentId &&
        currentDepth !== 0 &&
        beatIsVisible) ||
      (!timelineViewIsTabbed && beatIsVisible)
    )
  })

export const visibleBeatPositions = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed) => {
    return visibleBeatsByPosition(beats, beatHierarchyIsOn, timelineViewIsTabbed).reduce(
      (acc, beat, index) => {
        acc[beat.id] = index
        return acc
      },
      {}
    )
  }
)

const visibleBeatsByPositionIgnoringCollapsed = (beats, beatHierarchyIsOn) =>
  beatsByPosition(() => {
    return true
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    return beatHierarchyIsOn || currentDepth === maximumDepth
  })

// This version ignores the view that the timeline is on so it's intended for the *Outline*.
export const sparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  (beats, beatHierarchyIsOn) =>
    visibleBeatsByPosition(beats, beatHierarchyIsOn, false).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
)

export const timelineSparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed, activeTab) => {
    const activeParentId = topLevelVisibleBeatsByPosition(beats, beatHierarchyIsOn)[activeTab].id

    return visibleBeatsForTopLevelParentByPosition(
      beats,
      beatHierarchyIsOn,
      timelineViewIsTabbed,
      activeParentId
    ).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
  }
)

export const sortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatsByPosition(() => true)
)

export const sortedBeatsForAnotherBookSelector = createSelector(
  beatsForAnotherBookSelector,
  beatsByPosition(() => true)
)

export const templateBeatsForBookOne = createSelector(
  beatsForBookOne,
  beatsByPosition(() => true)
)

export const visibleSortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  visibleBeatsByPosition
)

export const visibleSortedBeatsForTimelineByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  visibleBeatsByPositionForTimeline
)

export const visibleSortedBeatsByBookIgnoringCollapsedSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  visibleBeatsByPositionIgnoringCollapsed
)

export const skipPrologueSelector = createSelector(sortedBeatsByBookSelector, (beats) =>
  beatOneIsPrologue(beats)
)

export const positionOffsetSelector = createSelector(skipPrologueSelector, (skip) =>
  skip ? -1 : 0
)

export const makeBeatSelector = () => createSelector(beatsByBookSelector, beatIdSelector, findNode)

export const beatHasChildrenSelector = createSelector(beatsByBookSelector, (beats) => {
  return reduce('id')(
    beats,
    (beatsHaveChildren, beat) => {
      beatsHaveChildren.set(beat.id, children(beats, beat.id).length > 0)
      return beatsHaveChildren
    },
    new Map()
  )
})

export const beatIndexSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  beatIdSelector,
  numberOfPriorChildrenAtSameDepth
)

export const makeBeatTitleSelector = () =>
  createSelector(
    beatIndexSelector,
    beatsByBookSelector,
    beatIdSelector,
    sortedHierarchyLevels,
    positionOffsetSelector,
    beatHierarchyIsOn,
    isSeriesSelector,
    (beatIndex, beats, beatId, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(
        beatIndex,
        beats,
        beat,
        hierarchyLevels,
        positionOffset,
        hierarchyEnabled,
        isSeries
      )
    }
  )

export const timelineTabsSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  sortedHierarchyLevels,
  skipPrologueSelector,
  (beats, sortedBeats, hierarchyLevels, skipPrologue) => {
    const atTopLevel = (beat) => {
      const currentDepth = depth(beats, beat.id)
      return currentDepth === 0
    }
    return beatsByPosition(atTopLevel)(beats)
      .filter(atTopLevel)
      .map((beat) => {
        const positionOffset = skipPrologue ? -1 : 0
        const hierarchyEnabled = true
        const isSeries = true
        const beatNode = findNode(beats, beat.id)
        const beatIndex = numberOfPriorChildrenAtSameDepth(beats, sortedBeats, beat.id)
        return beatTitle(
          beatIndex,
          beats,
          beatNode,
          hierarchyLevels,
          positionOffset,
          hierarchyEnabled,
          isSeries
        )
      })
  }
)

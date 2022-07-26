import { createSelector } from 'reselect'
import { times } from 'lodash'

import {
  currentTimelineSelector,
  isSeriesSelector,
  isSmallSelector,
  timelineSelectedTabSelector,
  timelineViewIsStackedSelector,
  timelineViewIsTabbedSelector,
} from './ui'
import {
  maxDepth,
  nextId,
  beatsByPosition,
  numberOfPriorChildrenAtSameDepth,
  beatTitle,
  beatOneIsPrologue,
  rootParentId,
} from '../helpers/beats'
import { findNode, children, depth, reduce, forEach, nodeParent } from '../reducers/tree'
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
    return expanded || !beatHierarchyIsOn || timelineViewIsTabbed
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

const visibleBeatsForTopLevelParentByPosition = (
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
      if (timelineViewIsStacked && currentDepth !== maximumDepth) {
        return {
          ...beat,
          isInsertChildCell: true,
        }
      }
      return beat
    })
}

export const visibleBeatPositions = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed) => {
    let lastRootIndex = 0
    let lastParentNodeId = null
    const reducer = timelineViewIsTabbed
      ? (acc, beat, index) => {
          const rootParentNodeId = rootParentId(beats, beat.id)
          if (lastParentNodeId !== rootParentNodeId) {
            lastRootIndex = index
            lastParentNodeId = rootParentNodeId
          }
          return {
            ...acc,
            [beat.id]: index - lastRootIndex,
          }
        }
      : (acc, beat, index) => {
          return {
            ...acc,
            [beat.id]: index,
          }
        }
    return visibleBeatsByPosition(beats, beatHierarchyIsOn, timelineViewIsTabbed).reduce(
      reducer,
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

export const timelineTabBeatIdsSelector = createSelector(beatsByBookSelector, (beats) => {
  const atTopLevel = (beat) => {
    const currentDepth = depth(beats, beat.id)
    return currentDepth === 0
  }
  return beatsByPosition(atTopLevel)(beats)
    .filter(atTopLevel)
    .map((beat) => {
      return beat.id
    })
})

export const timelineActiveTabSelector = createSelector(
  timelineSelectedTabSelector,
  timelineTabBeatIdsSelector,
  (tab, tabBeatIds) => {
    if (tabBeatIds.indexOf(tab) !== -1) {
      return tab
    }
    return tabBeatIds[0]
  }
)

export const visibleSortedBeatsForTimelineByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  visibleBeatsByPositionForTimeline
)

export const timelineSparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed, activeTab, timelineViewIsStacked, isSmall) => {
    const activeParentId = activeTab

    return visibleBeatsForTopLevelParentByPosition(
      beats,
      beatHierarchyIsOn,
      timelineViewIsTabbed,
      activeParentId,
      timelineViewIsStacked,
      isSmall
    ).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
  }
)

export const topTierBeatsInThreeTierArrangementSelector = createSelector(
  sortedHierarchyLevels,
  sortedBeatsByBookSelector,
  beatsByBookSelector,
  (hierarchyLevels, sortedBeats, beats) => {
    if (hierarchyLevels.length < 3) {
      return []
    }
    return sortedBeats.filter((beat) => {
      return depth(beats, beat.id) === 0
    })
  }
)

export const secondTierBeatsInAtLeastTwoTierArrangementSelector = createSelector(
  sortedHierarchyLevels,
  sortedBeatsByBookSelector,
  beatsByBookSelector,
  topTierBeatsInThreeTierArrangementSelector,
  (hierarchyLevels, sortedBeats, beats, topTierBeats) => {
    if (hierarchyLevels.length < 2) {
      return []
    }
    return sortedBeats
      .filter((beat) => {
        const currentDepth = depth(beats, beat.id)
        return (
          (hierarchyLevels.length === 3 && currentDepth === 1) ||
          (hierarchyLevels.length === 2 && currentDepth === 0)
        )
      })
      .flatMap((beat) => {
        const currentDepth = depth(beats, beat.id)
        // Beat must be at the right level.
        if (currentDepth === 0) {
          return [beat]
        }
        const beatParent = nodeParent(beats, beat.id)
        const indexOfParentInParents = topTierBeats.findIndex(({ id }) => {
          return id === beatParent
        })
        // There must be a parent beat for this beat, that's not in position zero
        if (indexOfParentInParents > 0) {
          // How many palceholders do we add?
          //  - Count the number of beats at the parent level of the current
          //    beat that have no children.
          let furthestIndexBackwardOfParentWithNoChildren
          for (
            furthestIndexBackwardOfParentWithNoChildren = indexOfParentInParents - 1;
            furthestIndexBackwardOfParentWithNoChildren > 0;
            furthestIndexBackwardOfParentWithNoChildren--
          ) {
            const priorParent = topTierBeats[furthestIndexBackwardOfParentWithNoChildren]
            const childrenOfPriorParent = children(beats, priorParent.id)
            // This is the furthest beat back that has children
            if (childrenOfPriorParent.length > 0) {
              break
            }
          }
          // If there was a beat with no children, then it was one
          // beat along.
          furthestIndexBackwardOfParentWithNoChildren++
          if (furthestIndexBackwardOfParentWithNoChildren < indexOfParentInParents) {
            // Insert placeholders for all of the missing beats
            return [
              ...times(indexOfParentInParents - furthestIndexBackwardOfParentWithNoChildren, () => {
                return {
                  type: 'insert-placeholder',
                }
              }),
              beat,
            ]
          }
          return [beat]
        }
        return [beat]
      })
  }
)

export const leavesPerBeatSelector = createSelector(beatsByBookSelector, (beats) => {
  const index = new Map()
  const leavesForBeat = (id) => {
    const currentCount = index.get(id)
    if (currentCount) {
      return currentCount
    }

    const nodeChildren = children(beats, id)
    if (nodeChildren.length === 0) {
      return 1
    }

    return nodeChildren
      .map(({ id }) => id)
      .map(leavesForBeat)
      .reduce((acc, childCount) => {
        return acc + childCount
      }, 0)
  }

  forEach(beats, ({ id }) => {
    index.set(id, leavesForBeat(id))
  })
  return index
})

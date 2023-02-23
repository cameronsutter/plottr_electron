import { sortBy, keyBy, times } from 'lodash'
import { createSelector } from 'reselect'

import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { reduce, depth, findNode, nodeParent, children, forEach } from '../reducers/tree'
import {
  beatsByPosition,
  rootParentId,
  beatTitle,
  numberOfPriorChildrenAtSameDepth,
  beatOneIsPrologue,
} from '../helpers/beats'
import { createDeepEqualSelector } from './createDeepEqualSelector'

// Other selector dependencies
import { allLinesSelector } from './linesFirstOrder'
import { allCardMetaDataSelector, allCardsSelector } from './cardsFirstOrder'
import {
  allBeatsSelector,
  beatIdSelector,
  visibleBeatsByPositionForTimeline,
  visibleBeatsByPositionIgnoringCollapsed,
  visibleBeatsForTopLevelParentByPosition,
} from './beatsFirstOrder'
import { isDarkModeSelector } from './settingsFirstOrder'
import {
  attributesDialogIsOpenSelector,
  beatsByBookSelector,
  currentTimelineSelector,
  hierarchyLevelCount,
  isLargeSelector,
  isMediumSelector,
  isSeriesSelector,
  isSmallSelector,
  outlineSearchTermSelector,
  sortedHierarchyLevels,
  timelineFilterIsEmptySelector,
  timelineFilterSelector,
  timelineScrollPositionSelector,
  timelineSearchTermSelector,
  timelineSelectedTabSelector,
  timelineSizeSelector,
  timelineViewIsntDefaultSelector,
  timelineViewIsStackedSelector,
  timelineViewIsTabbedSelector,
  uiSelector,
} from './secondOrder'

const selectedOrientationSelector = createSelector(uiSelector, ({ orientation }) => {
  return orientation
})
export const orientationSelector = createSelector(
  selectedOrientationSelector,
  isSmallSelector,
  timelineViewIsStackedSelector,
  (selectedOrientation, isSmall, timelineViewIsStacked) => {
    // Force horizontal view when we're on the stacked timeline.
    // Wehaven't thought through how flipped should look.
    if (selectedOrientation === 'vertical' && !isSmall && timelineViewIsStacked) {
      return 'horizontal'
    }
    return selectedOrientation
  }
)

export const timelineIsExpandedSelector = createSelector(uiSelector, ({ timelineIsExpanded }) => {
  return timelineIsExpanded
})

export const timelineBundleSelector = createSelector(
  timelineScrollPositionSelector,
  currentTimelineSelector,
  orientationSelector,
  timelineSizeSelector,
  timelineIsExpandedSelector,
  isDarkModeSelector,
  attributesDialogIsOpenSelector,
  timelineFilterIsEmptySelector,
  isSmallSelector,
  isMediumSelector,
  isLargeSelector,
  (
    timelineScrollPosition,
    currentTimeline,
    orientation,
    timelineSize,
    timelineIsExpanded,
    darkMode,
    attributesDialogIsOpen,
    filterIsEmpty,
    isSmall,
    isMedium,
    isLarge
  ) => ({
    timelineScrollPosition,
    currentTimeline,
    orientation,
    timelineSize,
    timelineIsExpanded,
    darkMode,
    attributesDialogIsOpen,
    filterIsEmpty,
    isSmall,
    isMedium,
    isLarge,
  })
)

export const linesByBookSelector = createSelector(
  allLinesSelector,
  currentTimelineSelector,
  (lines, bookId) => {
    return lines.filter((l) => l && l.bookId == bookId)
  }
)

export const lineIsExpandedSelector = createSelector(
  linesByBookSelector,
  timelineIsExpandedSelector,
  (lines, isExpanded) => {
    return lines.reduce((acc, l) => {
      // if line.expanded is null, then use timelineIsExpanded
      // else use line.expanded
      if (l.expanded == null) acc[l.id] = isExpanded
      else acc[l.id] = l.expanded

      return acc
    }, {})
  }
)

export const sortedLinesByBookSelector = createSelector(linesByBookSelector, (lines) =>
  sortBy(lines, 'position')
)

export const linesById = createSelector(sortedLinesByBookSelector, (lines) => {
  return keyBy(lines, 'id')
})

export const linePositionMappingSelector = createSelector(linesByBookSelector, (lines) => {
  return lines.reduce((acc, line) => {
    acc[line.position] = line
    return acc
  }, {})
})

export const sortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatsByPosition(() => true)
)

export const collapsedBeatSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  (beatTree, sortedBeats) => {
    const collapsedBeats = new Map()
    const firstCollapsedParent = (beatId) => {
      if (!beatId) return null
      if (collapsedBeats.has(beatId)) {
        return collapsedBeats.get(beatId)
      }
      const directParentId = nodeParent(beatTree, beatId)
      const collapsedParentId = firstCollapsedParent(directParentId)
      if (collapsedParentId) {
        collapsedBeats.set(beatId, collapsedParentId)
        return collapsedParentId
      }
      const thisBeat = findNode(beatTree, beatId)
      if (!thisBeat.expanded) {
        collapsedBeats.set(beatId, beatId)
        return beatId
      }
      collapsedBeats.set(beatId, null)
      return null
    }
    sortedBeats.forEach((beat) => {
      firstCollapsedParent(beat.id)
    })
    return collapsedBeats
  }
)

export const cardMapSelector = createSelector(
  allCardsSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  timelineViewIsntDefaultSelector,
  (cards, collapsedBeats, allSortedBeats, timelineViewIsntDefault) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(
      cardReduce('lineId', 'beatId', !timelineViewIsntDefault && collapsedBeats, beatPositions),
      {}
    )
  }
)

const visibleBeatsByPosition = (beats, timelineViewIsTabbed) =>
  beatsByPosition(({ expanded }) => {
    return expanded || timelineViewIsTabbed
  })(beats).filter(({ id }) => {
    const currentDepth = depth(beats, id)
    return (timelineViewIsTabbed && currentDepth !== 0) || !timelineViewIsTabbed
  })

export const visibleSortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  timelineViewIsTabbedSelector,
  visibleBeatsByPosition
)

export const lineMaxCardsSelector = createSelector(
  linesByBookSelector,
  cardMapSelector,
  visibleSortedBeatsByBookSelector,
  (lines, cardMap, beats) => {
    return lines.reduce((acc, l) => {
      let max = 0
      beats.forEach((beat) => {
        const cards = cardMap[`${l.id}-${beat.id}`]
        if (cards && cards.length > max) max = cards.length
      })
      acc[l.id] = max
      return acc
    }, {})
  }
)

const bookIdSelector = (state, bookId) => bookId
export const firstVisibleBeatForBookSelector = createSelector(
  allBeatsSelector,
  bookIdSelector,
  timelineViewIsTabbedSelector,
  (beats, bookId, timelineIsTabbed) => {
    const firstVisibleBeat = visibleBeatsByPosition(beats[bookId], timelineIsTabbed)[0]
    return firstVisibleBeat
  }
)

export const visibleBeatPositions = createSelector(
  beatsByBookSelector,
  timelineViewIsTabbedSelector,
  (beats, timelineViewIsTabbed) => {
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
    return visibleBeatsByPosition(beats, timelineViewIsTabbed).reduce(reducer, {})
  }
)

// This version ignores the view that the timeline is on so it's intended for the *Outline*.
export const sparceBeatMap = createSelector(beatsByBookSelector, (beats) =>
  visibleBeatsByPosition(beats, false).reduce((acc, beat, index) => {
    acc[index] = beat.id
    return acc
  }, {})
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

export const makeBeatTitleSelector = () =>
  createSelector(
    beatIndexSelector,
    beatsByBookSelector,
    beatIdSelector,
    sortedHierarchyLevels,
    positionOffsetSelector,
    isSeriesSelector,
    (beatIndex, beats, beatId, hierarchyLevels, positionOffset, isSeries) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(beatIndex, beats, beat, hierarchyLevels, positionOffset)
    }
  )

export const skipPrologueSelector = createSelector(sortedBeatsByBookSelector, (beats) =>
  beatOneIsPrologue(beats)
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
        const beatNode = findNode(beats, beat.id)
        const beatIndex = numberOfPriorChildrenAtSameDepth(beats, sortedBeats, beat.id)
        return beatTitle(beatIndex, beats, beatNode, hierarchyLevels, positionOffset)
      })
  }
)

export const visibleSortedBeatsByBookIgnoringCollapsedSelector = createSelector(
  beatsByBookSelector,
  visibleBeatsByPositionIgnoringCollapsed
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
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  visibleBeatsByPositionForTimeline
)

export const timelineSparceBeatMap = createSelector(
  beatsByBookSelector,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  (beats, timelineViewIsTabbed, activeTab, timelineViewIsStacked, isSmall) => {
    const activeParentId = activeTab

    return visibleBeatsForTopLevelParentByPosition(
      beats,
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

export const cardsExistOnTimelineSelector = createSelector(
  allCardMetaDataSelector,
  visibleSortedBeatsByBookIgnoringCollapsedSelector,
  (allCardsMetaData, visibleSortedBeats) => {
    return (
      allCardsMetaData.filter(({ beatId }) => visibleSortedBeats.find(({ id }) => id === beatId))
        .length > 0
    )
  }
)

const stringifiedCardsByIdSelector = createSelector(allCardsSelector, (cards) => {
  return cards.reduce((acc, nextCard) => {
    return {
      ...acc,
      [nextCard.id]: JSON.stringify(nextCard).toLowerCase(),
    }
  }, {})
})

export const outlineSearchedCardMapSelector = createSelector(
  allCardsSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  outlineSearchTermSelector,
  stringifiedCardsByIdSelector,
  (cards, collapsedBeats, allSortedBeats, outlineSearchTerm, stringifiedCards) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    const lowerCaseSearchTerms =
      outlineSearchTerm &&
      outlineSearchTerm
        .toLowerCase()
        .split(' ')
        .filter((x) => x)
    const filteredCards = lowerCaseSearchTerms
      ? cards.filter(({ id }) => {
          return outOfOrderSearch(lowerCaseSearchTerms, stringifiedCards[id])
        })
      : cards
    return filteredCards.reduce(cardReduce('lineId', 'beatId', collapsedBeats, beatPositions), {})
  }
)

export const cardMetaDataMapSelector = createDeepEqualSelector(
  allCardMetaDataSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  (cards, collapsedBeats, allSortedBeats) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(cardReduce('lineId', 'beatId', collapsedBeats, beatPositions), {})
  }
)

export const searchedCardMetaDataMapSelector = createDeepEqualSelector(
  allCardMetaDataSelector,
  collapsedBeatSelector,
  visibleSortedBeatsForTimelineByBookSelector,
  timelineSearchTermSelector,
  stringifiedCardsByIdSelector,
  beatsByBookSelector,
  timelineViewIsStackedSelector,
  hierarchyLevelCount,
  timelineViewIsntDefaultSelector,
  (
    cards,
    collapsedBeats,
    allSortedBeats,
    timelineSearchTerm,
    stringifiedCards,
    beats,
    timelineViewIsStacked,
    hierarchyLevelCount,
    timelineViewIsntDefault
  ) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    const lowerCaseSearchTerms =
      timelineSearchTerm &&
      timelineSearchTerm
        .toLowerCase()
        .split(' ')
        .filter((x) => x)

    const filteredCards = (
      lowerCaseSearchTerms
        ? cards.filter(({ id, beatId }) => {
            return outOfOrderSearch(lowerCaseSearchTerms, stringifiedCards[id])
          })
        : cards
    ).filter(({ beatId }) => {
      const beatIsALeaf = depth(beats, beatId) === hierarchyLevelCount - 1
      return !timelineViewIsStacked || beatIsALeaf
    })

    return filteredCards.reduce(
      cardReduce('lineId', 'beatId', !timelineViewIsntDefault && collapsedBeats, beatPositions),
      {}
    )
  }
)

export const visibleCardsSelector = createSelector(
  allCardsSelector,
  timelineFilterSelector,
  timelineFilterIsEmptySelector,
  (cards, filter, filterIsEmpty) => {
    return cards.reduce((acc, c) => {
      acc[c.id] = cardIsVisible(c, filter, filterIsEmpty)
      return acc
    }, {})
  }
)

function cardReduce(lineAttr, beatAttr, collapsedBeats, beatPositions) {
  return (acc, card) => {
    const cardBeatId = card[beatAttr]
    const beatId = (collapsedBeats && collapsedBeats.get(cardBeatId)) || cardBeatId
    const val = acc[`${card[lineAttr]}-${beatId}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(sortBy(cards, 'positionWithinLine'), (card) => {
        const beatId = card[beatAttr]
        return beatPositions[beatId]
      })
      acc[`${card[lineAttr]}-${beatId}`] = sortedCards
    } else {
      acc[`${card[lineAttr]}-${beatId}`] = [card]
    }

    return acc
  }
}

function cardIsVisible(card, filter, filterIsEmpty) {
  if (filterIsEmpty) return true

  return Object.keys(filter).some((attr) => {
    return filter[attr].some((val) => {
      if (card[attr] !== undefined) {
        return card[attr] === val
      }
      if (!val && !card[attr]) {
        return true
      }
      if (attr == 'tag') {
        return card.tags.includes(val)
      }
      if (attr == 'character') {
        return card.characters.includes(val)
      }
      if (attr == 'place') {
        return card.places.includes(val)
      }
      return false
    })
  })
}

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector, isSeriesSelector } from './ui'
import { maxDepth, nextId } from '../helpers/beats'
import { beatTitle, beatOneIsPrologue } from '../helpers/beats'
import { findNode, children, depth } from '../reducers/tree'
import { sortedHierarchyLevels } from './hierarchy'
import { beatHierarchyIsOn } from './featureFlags'

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

export const beatsForBookOne = createSelector(allBeatsSelector, (beats) => {
  return beats[1]
})

export const beatsByPosition = (predicate) => (beats) => {
  function iter(beats, id) {
    const currentBeat = id === null ? [] : [findNode(beats, id)]
    if (currentBeat.length && !predicate(currentBeat[0])) return currentBeat
    const sortedChildren = sortBy(children(beats, id), 'position')
    return [...currentBeat, ...sortedChildren.flatMap((child) => iter(beats, child.id))]
  }
  return iter(beats, null)
}

const visibleBeatsByPosition = (beats, beatHierarchyIsOn) =>
  beatsByPosition(({ expanded }) => {
    return expanded || !beatHierarchyIsOn
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    return beatHierarchyIsOn || currentDepth === maximumDepth
  })

export const sparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  (beats, beatHierarchyIsOn) =>
    visibleBeatsByPosition(beats, beatHierarchyIsOn).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
)

export const sortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatsByPosition(() => true)
)

export const templateBeatsForBookOne = createSelector(
  beatsForBookOne,
  beatsByPosition(() => true)
)

export const visibleSortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  visibleBeatsByPosition
)

export const skipPrologueSelector = createSelector(sortedBeatsByBookSelector, (beats) =>
  beatOneIsPrologue(beats)
)

export const positionOffsetSelector = createSelector(skipPrologueSelector, (skip) =>
  skip ? -1 : 0
)

export const makeBeatSelector = () => createSelector(beatsByBookSelector, beatIdSelector, findNode)

export const makeBeatTitleSelector = () =>
  createSelector(
    beatsByBookSelector,
    beatIdSelector,
    sortedHierarchyLevels,
    positionOffsetSelector,
    beatHierarchyIsOn,
    isSeriesSelector,
    (beats, beatId, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(beats, beat, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries)
    }
  )

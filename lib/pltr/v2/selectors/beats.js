import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { nextId } from '../helpers/beats'
import { beatTitle, beatOneIsPrologue } from '../helpers/beats'
import { findNode, children } from '../reducers/tree'
import { sortedHierarchyLevels } from './hierarchy'

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

export const beatsByPosition = (predicate) => (beats) => {
  function iter(beats, id) {
    const currentBeat = id === null ? [] : [findNode(beats, id)]
    if (currentBeat.length && !predicate(currentBeat[0])) return currentBeat
    const sortedChildren = sortBy(children(beats, id), 'position')
    return [...currentBeat, ...sortedChildren.flatMap((child) => iter(beats, child.id))]
  }
  return iter(beats, null)
}

export const visibleBeatsByPosition = beatsByPosition(({ expanded }) => expanded)

export const sparceBeatMap = createSelector(beatsByBookSelector, (beats) =>
  visibleBeatsByPosition(beats).reduce((acc, beat, index) => {
    acc[index] = beat.id
    return acc
  }, {})
)

export const sortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatsByPosition(() => true)
)

export const visibleSortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
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
    (beats, beatId, hierarchyLevels, positionOffset) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(beats, beat, hierarchyLevels, positionOffset)
    }
  )

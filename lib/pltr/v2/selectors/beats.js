import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { nextId } from '../helpers/beats'
import { beatTitle, beatOneIsPrologue } from '../helpers/beats'
import { findNode, children } from '../reducers/tree'

export const allBeatsSelector = (state) => state.beats
const beatIdSelector = (state, beatId) => beatId

export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats[bookId]
  }
)

export const beatsByPosition = (beats) => {
  function iter(beats, id) {
    const currentBeat = id === null ? [] : [findNode(beats, id)]
    return [
      ...currentBeat,
      ...sortBy(
        children(beats, id).flatMap((child) => iter(beats, child.id)),
        'position'
      ),
    ]
  }
  return iter(beats, null)
}

export const sparceBeatMap = createSelector(beatsByBookSelector, (beats) =>
  beatsByPosition(beats).reduce((acc, beat, index) => {
    acc[index] = beat.id
    return acc
  }, {})
)

export const sortedBeatsByBookSelector = createSelector(beatsByBookSelector, beatsByPosition)

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
    positionOffsetSelector,
    (beats, beatId, positionOffset) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(beats, beat, positionOffset)
    }
  )

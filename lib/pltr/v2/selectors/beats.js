import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { nextId } from '../store/newIds'
import { beatTitle, beatOneIsPrologue } from '../helpers/beats'

export const allBeatsSelector = (state) => state.beats
const beatIdSelector = (state, beatId) => beatId

export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats.filter((beat) => beat.bookId === bookId)
  }
)

export const sortedBeatsByBookSelector = createSelector(beatsByBookSelector, (beats) =>
  sortBy(beats, 'position')
)

export const skipPrologueSelector = createSelector(sortedBeatsByBookSelector, (beats) =>
  beatOneIsPrologue(beats)
)

export const positionOffsetSelector = createSelector(skipPrologueSelector, (skip) =>
  skip ? -1 : 0
)

export const makeBeatSelector = () =>
  createSelector(beatsByBookSelector, beatIdSelector, (beats, beatId) =>
    beats.find(({ id }) => id == beatId)
  )

export const makeBeatTitleSelector = () =>
  createSelector(
    beatsByBookSelector,
    beatIdSelector,
    positionOffsetSelector,
    (beats, beatId, positionOffset) => {
      const beat = beats.find(({ id }) => id == beatId)
      if (!beat) return ''
      return beatTitle(beat, positionOffset)
    }
  )

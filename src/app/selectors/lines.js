import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { allSeriesLinesSelector } from './seriesLines'

export const allLinesSelector = state => state.lines

export const linesByBookSelector = createSelector(
  allLinesSelector,
  currentTimelineSelector,
  allSeriesLinesSelector,
  (lines, bookId, seriesLines) => {
    if (bookId == 'series') {
      return seriesLines
    } else {
      return lines.filter(l => l.bookId == bookId)
    }
  }
)

export const sortedLinesByBookSelector = createSelector(
  linesByBookSelector,
  (lines) => sortBy(lines, 'position')
)

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector, timelineIsExpandedSelector } from './ui'
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
      return lines.filter(l => l && l.bookId == bookId)
    }
  }
)

export const sortedLinesByBookSelector = createSelector(
  linesByBookSelector,
  (lines) => sortBy(lines, 'position')
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

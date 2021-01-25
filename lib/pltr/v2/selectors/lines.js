import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector, timelineIsExpandedSelector } from './ui'
import { allSeriesLinesSelector } from './seriesLines'
import { cardMapSelector } from './cards'
import { chaptersByBookSelector } from './chapters'
import { nextId } from '../store/newIds'

export const allLinesSelector = (state) => state.lines

export const nextLineIdSelector = createSelector(allLinesSelector, (lines) => nextId(lines))

export const linesByBookSelector = createSelector(
  allLinesSelector,
  currentTimelineSelector,
  allSeriesLinesSelector,
  (lines, bookId, seriesLines) => {
    if (bookId == 'series') {
      return seriesLines
    } else {
      return lines.filter((l) => l && l.bookId == bookId)
    }
  }
)

export const sortedLinesByBookSelector = createSelector(linesByBookSelector, (lines) =>
  sortBy(lines, 'position')
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

export const linePositionMappingSelector = createSelector(linesByBookSelector, (lines) => {
  return lines.reduce((acc, line) => {
    acc[line.position] = line
    return acc
  }, {})
})

export const lineMaxCardsSelector = createSelector(
  linesByBookSelector,
  cardMapSelector,
  chaptersByBookSelector,
  (lines, cardMap, chapters) => {
    return lines.reduce((acc, l) => {
      let max = 0
      chapters.forEach((ch) => {
        const cards = cardMap[`${l.id}-${ch.id}`]
        if (cards && cards.length > max) max = cards.length
      })
      acc[l.id] = max
      return acc
    }, {})
  }
)

// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { nextId } from '../store/newIds'
import { isSeries } from '../helpers/lines'

export const allSeriesLinesSelector = (state) => state.lines.filter(isSeries)

export const allLinesSelector = (state) => state.lines

export const nextLineIdSelector = createSelector(allLinesSelector, (lines) => nextId(lines))

const bookIdSelector = (state, bookId) => bookId
export const linesForBookSelector = createSelector(
  allLinesSelector,
  bookIdSelector,
  (lines, bookId) => {
    return lines.filter((l) => l && l.bookId == bookId)
  }
)

export const firstLineForBookSelector = createSelector(linesForBookSelector, (lines) => {
  return sortBy(lines, 'position')[0]
})

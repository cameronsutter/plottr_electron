import { createSelector } from 'reselect'
import { currentTimelineSelector } from './ui'
import { allBeatsSelector } from './beats'

export const allChaptersSelector = state => state.chapters

export const chaptersByBookSelector = createSelector(
  allChaptersSelector,
  currentTimelineSelector,
  allBeatsSelector,
  (chapters, bookId, beats) => {
    if (bookId == 'series') {
      return beats
    } else {
      return chapters.filter(ch => ch.bookId == bookId)
    }
  }
)

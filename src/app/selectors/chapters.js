import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector, isSeriesSelector } from './ui'
import { allBeatsSelector } from './beats'
import { chapterTitle } from '../helpers/chapters'

export const allChaptersSelector = state => state.chapters
const chapterIdSelector = (state, chapterId) => chapterId

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

export const sortedChaptersByBookSelector = createSelector(
  chaptersByBookSelector,
  (chapters) => sortBy(chapters, 'position')
)

export const makeChapterSelector = () => createSelector(
  chaptersByBookSelector,
  chapterIdSelector,
  (chapters, chapterId) => chapters.find(ch => ch.id == chapterId)
)

export const makeChapterNameSelector = () => createSelector(
  isSeriesSelector,
  chaptersByBookSelector,
  chapterIdSelector,
  (isSeries, chapters, chapterId) => {
    const chapter = chapters.find(ch => ch.id == chapterId)
    if (!chapter) return ''
    return chapterTitle(chapter, isSeries)
  }
)

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { currentTimelineSelector, isSeriesSelector } from './ui'
import { allBeatsSelector } from './beats'
import { chapterTitle, chapterOneIsPrologue } from '../helpers/chapters'
import { nextId } from '../store/newIds'

export const allChaptersSelector = (state) => state.chapters
const chapterIdSelector = (state, chapterId) => chapterId

export const nextChapterIdSelector = createSelector(allChaptersSelector, (chapters) =>
  nextId(chapters)
)

export const chaptersByBookSelector = createSelector(
  allChaptersSelector,
  currentTimelineSelector,
  allBeatsSelector,
  (chapters, bookId, beats) => {
    if (bookId == 'series') {
      return beats
    } else {
      return chapters.filter((ch) => ch.bookId == bookId)
    }
  }
)

export const sortedChaptersByBookSelector = createSelector(chaptersByBookSelector, (chapters) =>
  sortBy(chapters, 'position')
)

export const skipPrologueSelector = createSelector(sortedChaptersByBookSelector, (chapters) =>
  chapterOneIsPrologue(chapters)
)

export const positionOffsetSelector = createSelector(skipPrologueSelector, (skip) =>
  skip ? -1 : 0
)

export const makeChapterSelector = () =>
  createSelector(chaptersByBookSelector, chapterIdSelector, (chapters, chapterId) =>
    chapters.find((ch) => ch.id == chapterId)
  )

export const makeChapterTitleSelector = () =>
  createSelector(
    isSeriesSelector,
    chaptersByBookSelector,
    chapterIdSelector,
    positionOffsetSelector,
    (isSeries, chapters, chapterId, positionOffset) => {
      const chapter = chapters.find((ch) => ch.id == chapterId)
      if (!chapter) return ''
      return chapterTitle(chapter, positionOffset, isSeries)
    }
  )

export const chapterPositionMappingSelector = createSelector(chaptersByBookSelector, (chapters) => {
  return chapters.reduce((acc, chapter) => {
    acc[chapter.position] = chapter.id
    return acc
  }, {})
})

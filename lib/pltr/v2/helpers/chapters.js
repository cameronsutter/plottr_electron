import i18n from 'format-message'
import { chapter } from '../store/initialState'

export function chapterOneIsPrologue(sortedBookChapters) {
  return sortedBookChapters[0].title == i18n('Prologue')
}

export function chapterTitle(chapter, offset, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return chapter.title == 'auto'
      ? i18n('Beat {number}', { number: chapter.position + offset + 1 })
      : chapter.title
  } else {
    return chapter.title == 'auto'
      ? i18n('Chapter {number}', { number: chapter.position + offset + 1 })
      : chapter.title
  }
}

export function editingChapterLabel(chapter, offset, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return i18n('Beat {number} title', { number: chapter.position + offset + 1 })
  } else {
    return i18n('Chapter {number} title', { number: chapter.position + offset + 1 })
  }
}

export function chapterPositionTitle(chapter, offset, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return i18n('Beat {number}', { number: chapter.position + offset + 1 })
  } else {
    return i18n('Chapter {number}', { number: chapter.position + offset + 1 })
  }
}

export function insertChapter(position, chapters, newId, bookId) {
  var newChapter = Object.assign({}, chapter, { id: newId, bookId: bookId })

  chapters.splice(position, 0, newChapter)
  return chapters
}

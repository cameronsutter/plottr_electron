import i18n from 'format-message'
import _ from 'lodash'
import { chapter } from '../../../shared/initialState'

export function chapterTitle (chapter, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return chapter.title == 'auto' ? i18n('Beat {number}', {number: chapter.position + 1}) : chapter.title
  } else {
    return chapter.title == 'auto' ? i18n('Chapter {number}', {number: chapter.position + 1}) : chapter.title
  }
}

export function editingChapterLabel (chapter, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return i18n('Beat {number} title', {number: chapter.position + 1})
  } else {
    return i18n('Chapter {number} title', {number: chapter.position + 1})
  }
}

export function insertChapter (position, chapters, newId, bookId) {
  var newChapter = Object.assign({}, chapter, {id: newId, bookId: bookId})

  chapters.splice(position, 0, newChapter)
  return chapters
}
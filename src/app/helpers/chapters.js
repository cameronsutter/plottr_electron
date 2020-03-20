import i18n from 'format-message'
import _ from 'lodash'
import { chapter } from '../../../shared/initialState'

export function chapterTitle (chapter) {
  return chapter.title == 'auto' ? i18n('Chapter {number}', {number: chapter.position + 1}) : chapter.title
}

export function insertChapter (position, chapters, newId) {
  var newChapter = Object.assign(chapter, {id: newId})

  const sortedChapters = _.sortBy(chapters, 'position')
  sortedChapters.splice(position, 0, newChapter)
  return sortedChapters
}
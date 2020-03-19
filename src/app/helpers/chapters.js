import i18n from 'format-message'

export function chapterTitle (chapter) {
  return chapter.title == 'auto' ? i18n('Chapter {number}', {number: chapter.position + 1}) : chapter.title
}
import { ADD_CHAPTER, EDIT_CHAPTER_TITLE } from 'constants/ActionTypes'

export function addChapter (title) {
  return { type: ADD_CHAPTER, title }
}

export function editChapterTitle (id, title) {
  return { type: EDIT_CHAPTER_TITLE, id, title }
}

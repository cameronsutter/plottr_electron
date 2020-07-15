import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE, AUTO_SORT_CHAPTER } from 'constants/ActionTypes'
import { chapter } from '../../../shared/initialState'

export function addScene (bookId) {
  return { type: ADD_SCENE, title: chapter.title, bookId }
}

export function editSceneTitle (id, title) {
  return { type: EDIT_SCENE_TITLE, id, title }
}

export function reorderScenes (chapters, bookId) {
  return { type: REORDER_SCENES, chapters, bookId }
}

export function deleteScene (id, bookId) {
  return { type: DELETE_SCENE, id, bookId }
}

export function autoSortChapter (id, isSeries) {
  return { type: AUTO_SORT_CHAPTER, id, isSeries }
}

import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE } from 'constants/ActionTypes'
import { chapter } from '../../../shared/initialState'

export function addScene (bookId) {
  return { type: ADD_SCENE, title: chapter.title, bookId }
}

export function editSceneTitle (id, title) {
  return { type: EDIT_SCENE_TITLE, id, title }
}

export function reorderScenes (chapters) {
  return { type: REORDER_SCENES, chapters }
}

export function deleteScene (id) {
  return { type: DELETE_SCENE, id }
}

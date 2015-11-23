import { ADD_SCENE, EDIT_SCENE_TITLE, CHANGE_CHAPTER } from '../constants/ActionTypes'
import { scene } from 'store/initialState'

export function addScene (chapterId, position) {
  return { type: ADD_SCENE, title: scene.title, chapterId, position }
}

export function editSceneTitle (id, title) {
  return { type: EDIT_SCENE_TITLE, id, title }
}

export function changeChapter (id, newChapterId) {
  return { type: CHANGE_CHAPTER, id, newChapterId }
}

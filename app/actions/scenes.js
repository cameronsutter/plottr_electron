import { ADD_SCENE, EDIT_SCENE_TITLE, CHANGE_CHAPTER } from '../constants/ActionTypes'
import { scene } from 'store/initialState'

export function addScene (chapterId) {
  return { type: ADD_SCENE, title: scene.title, chapterId }
}

export function editSceneTitle (id, title) {
  return { type: EDIT_SCENE_TITLE, id, title }
}

export function changeChapter (id, chapterId) {
  return { type: CHANGE_CHAPTER, id, chapterId }
}

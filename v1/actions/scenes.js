import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE } from '../constants/ActionTypes'
import { scene } from '../store/initialState'

export function addScene() {
  return { type: ADD_SCENE, title: scene.title }
}

export function editSceneTitle(id, title) {
  return { type: EDIT_SCENE_TITLE, id, title }
}

export function reorderScenes(scenes) {
  return { type: REORDER_SCENES, scenes }
}

export function deleteScene(id) {
  return { type: DELETE_SCENE, id }
}

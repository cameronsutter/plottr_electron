import { ADD_SCENE, EDIT_SCENE_TITLE, CHANGE_CHAPTER, FILE_LOADED } from '../constants/ActionTypes'
import { scene } from 'store/initialState'

const initialState = [scene]

export default function scenes (state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [{
        id: state.reduce((maxId, scene) => Math.max(scene.id, maxId), -1) + 1,
        title: action.title,
        chapterId: action.chapterId,
        position: action.position || state.reduce((maxPosition, scene) => Math.max(scene.position, maxPosition), -1) + 1
      }, ...state]

    case EDIT_SCENE_TITLE:
      return state.map(scene =>
        scene.id === action.id ? Object.assign({}, scene, {title: action.title}) : scene
      )

    case CHANGE_CHAPTER:
      return state.map(scene =>
        scene.id === action.id ? Object.assign({}, scene, {chapterId: action.chapterId}) : scene
      )

    case FILE_LOADED:
      return action.data.scenes

    default:
      return state
  }
}

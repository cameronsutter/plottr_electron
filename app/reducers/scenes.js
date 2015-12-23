import { ADD_SCENE, EDIT_SCENE_TITLE, CHANGE_CHAPTER, REORDER_SCENES, DELETE_SCENE, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { scene } from 'store/initialState'
import { sceneId } from 'store/newIds'

const initialState = [scene]

export default function scenes (state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [{
        id: sceneId(state),
        title: action.title,
        chapterId: action.chapterId,
        position: state.reduce((maxPosition, scene) => Math.max(scene.position, maxPosition), -1) + 1
      }, ...state]

    case EDIT_SCENE_TITLE:
      return state.map(scene =>
        scene.id === action.id ? Object.assign({}, scene, {title: action.title}) : scene
      )

    case CHANGE_CHAPTER:
      return state.map(scene =>
        scene.id === action.id ? Object.assign({}, scene, {chapterId: action.chapterId}) : scene
      )

    case DELETE_SCENE:
      return state.filter(scene =>
        scene.id !== action.id
      )

    case REORDER_SCENES:
      return action.scenes

    case FILE_LOADED:
      return action.data.scenes

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}

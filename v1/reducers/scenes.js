import _ from 'lodash'
import {
  ADD_SCENE,
  EDIT_SCENE_TITLE,
  REORDER_SCENES,
  DELETE_SCENE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
} from '../constants/ActionTypes'
import { scene } from '../store/initialState'
import { newFileScenes } from '../store/newFileState'
import { sceneId, scenePosition } from '../store/newIds'

const initialState = [scene]

export default function scenes(state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [
        {
          id: sceneId(state),
          title: action.title,
          position: scenePosition(state),
        },
        ...state,
      ]

    case EDIT_SCENE_TITLE:
      return state.map((scene) =>
        scene.id === action.id ? Object.assign({}, scene, { title: action.title }) : scene
      )

    case DELETE_SCENE:
      let scenes = state.filter((scene) => scene.id !== action.id)
      let newScenes = _.sortBy(scenes, 'position')
      newScenes.forEach((s, idx) => (s['position'] = idx))
      return newScenes

    case REORDER_SCENES:
      return action.scenes

    case RESET:
    case FILE_LOADED:
      return action.data.scenes

    case NEW_FILE:
      return newFileScenes

    default:
      return state
  }
}

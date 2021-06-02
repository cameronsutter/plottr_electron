import {
  ADD_IMAGE,
  RENAME_IMAGE,
  DELETE_IMAGE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
} from '../constants/ActionTypes'
import { newFileImages } from '../store/newFileState'
import { imageId } from '../store/newIds'

const cards = (dataRepairers) => (state, action) => {
  switch (action.type) {
    case ADD_IMAGE: {
      const newId = imageId(state)
      const newImage = Object.assign({}, action.image, { id: newId })
      return {
        ...state,
        [newId]: newImage,
      }
    }

    case RENAME_IMAGE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          name: action.name,
        },
      }

    case DELETE_IMAGE:
      return Object.keys(state).reduce((acc, id) => {
        if (id != action.id) {
          acc[id] = state[id]
        }
        return acc
      }, {})

    case RESET:
    case FILE_LOADED:
      return action.data.images

    case NEW_FILE:
      return newFileImages

    default:
      return state || {}
  }
}

export default cards

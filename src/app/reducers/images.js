import { ADD_IMAGE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { newFileImages } from 'store/newFileState'
import { imageId } from 'store/newIds'

export default function cards (state, action) {
  switch (action.type) {
    case ADD_IMAGE:
      const newId = imageId(state)
      const newImage = Object.assign({}, action.image, {id: newId})
      return {
        ...state,
        [newId]: newImage,
      }

    case RESET:
    case FILE_LOADED:
      return action.data.images

    case NEW_FILE:
      return newFileImages

    default:
      return state || {}
  }
}
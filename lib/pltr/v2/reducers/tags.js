import {
  ADD_TAG,
  ADD_CREATED_TAG,
  EDIT_TAG,
  DELETE_TAG,
  FILE_LOADED,
  NEW_FILE,
  RESET,
} from '../constants/ActionTypes'
import { tag } from '../store/initialState'
import { newFileTags } from '../store/newFileState'
import { nextId } from '../store/newIds'

const initialState = [tag]

export default function tags(state = initialState, action) {
  switch (action.type) {
    case ADD_TAG:
      return [
        ...state,
        {
          id: nextId(state),
          title: tag.title,
          color: tag.color,
        },
      ]

    case ADD_CREATED_TAG:
      return [
        ...state,
        {
          ...tag,
          id: nextId(state),
          ...action.attributes,
        },
      ]

    case EDIT_TAG:
      return state.map((tag) =>
        tag.id === action.id
          ? Object.assign({}, tag, { title: action.title, color: action.color })
          : tag
      )

    case DELETE_TAG:
      return state.filter((tag) => tag.id !== action.id)

    case RESET:
    case FILE_LOADED:
      return action.data.tags

    case NEW_FILE:
      return newFileTags

    default:
      return state
  }
}

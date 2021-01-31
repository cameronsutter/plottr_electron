import {
  ADD_TAG,
  ADD_TAG_WITH_VALUES,
  EDIT_TAG,
  CHANGE_TAG_COLOR,
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

    case ADD_TAG_WITH_VALUES:
      return [
        ...state,
        {
          id: nextId(state),
          title: action.title,
          color: action.color || tag.color,
        },
      ]

    case CHANGE_TAG_COLOR:
      return state.map((tag) =>
        tag.id === action.id ? Object.assign({}, tag, { color: action.color }) : tag
      )

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

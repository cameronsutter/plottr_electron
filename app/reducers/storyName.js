import { EDIT_STORY_NAME, FILE_LOADED } from '../constants/ActionTypes'

export default function storyName (state = '', action) {
  switch (action.type) {
    case EDIT_STORY_NAME:
      return action.name

    case FILE_LOADED:
      return action.data.storyName

    default:
      return state
  }
}

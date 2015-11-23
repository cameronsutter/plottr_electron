import { EDIT_STORY_NAME, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { storyName as defaultStoryName } from 'store/initialState'

export default function storyName (state = defaultStoryName, action) {
  switch (action.type) {
    case EDIT_STORY_NAME:
      return action.name

    case FILE_LOADED:
      return action.data.storyName

    case NEW_FILE:
      return defaultStoryName

    default:
      return state
  }
}

import { EDIT_STORY_NAME, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { storyName as defaultStoryName } from '../store/initialState'

export default function storyName(state = defaultStoryName, action) {
  switch (action.type) {
    case EDIT_STORY_NAME:
      return action.name

    case RESET:
    case FILE_LOADED:
      return action.data.storyName

    case NEW_FILE:
      const separator = process.platform === 'darwin' ? '/' : '\\'
      return action.fileName.substr(action.fileName.lastIndexOf(separator) + 1).replace('.pltr', '')

    default:
      return state
  }
}

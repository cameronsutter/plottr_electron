import { FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { newFileCategories } from '../../../shared/newFileState'
import { categories as defaultCategories } from '../store/initialState'

export default function categories (state = defaultCategories, action) {
  switch (action.type) {
    case RESET:
    case FILE_LOADED:
      return action.data.categories

    case NEW_FILE:
      return newFileCategories

    default:
      return state
  }
}
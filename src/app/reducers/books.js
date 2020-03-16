import { FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { book as defaultBook } from '../../../shared/initialState'
import { newFileBooks } from '../../../shared/newFileState'

export default function books (state = defaultBook, action) {
  switch (action.type) {

    case RESET:
    case FILE_LOADED:
      return action.data.books

    case NEW_FILE:
      // TODO: maybe use this
      // const separator = process.platform === 'darwin' ? '/' : '\\'
      // return action.fileName.substr(action.fileName.lastIndexOf(separator) + 1).replace('.pltr', '')
      return newFileBooks

    default:
      return state
  }
}
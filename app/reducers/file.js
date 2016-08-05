import { FILE_LOADED, FILE_SAVED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { file as defaultFile } from 'store/initialState'
import { saveToLocalStorage } from 'store/localStorage'

export default function file (state = defaultFile, action) {
  switch (action.type) {
    case FILE_LOADED:
      saveToLocalStorage(action.fileName)
      return { fileName: action.fileName, loaded: true, dirty: false }

    case FILE_SAVED:
      return Object.assign({}, state, {dirty: false})

    case NEW_FILE:
      saveToLocalStorage(action.fileName)
      return { fileName: action.fileName, loaded: true, dirty: false }

    case RESET:
      return Object.assign({}, action.data.file, {dirty: true})

    default:
      return Object.assign({}, state, {dirty: true})
  }
}

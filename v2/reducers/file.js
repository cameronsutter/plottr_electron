import { FILE_LOADED, FILE_SAVED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { file as defaultFile } from '../store/initialState'

export default function file (state = defaultFile, action) {
  switch (action.type) {
    case FILE_LOADED:
      return { fileName: action.fileName, loaded: true, dirty: action.dirty, version: action.version }

    case FILE_SAVED:
      return Object.assign({}, state, {dirty: false})

    case NEW_FILE:
      return { fileName: action.fileName, loaded: true, dirty: false, version: action.version }

    case RESET:
      return Object.assign({}, action.data.file, {dirty: true})

    default:
      return Object.assign({}, state, {dirty: true})
  }
}

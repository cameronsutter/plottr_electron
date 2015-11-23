import { FILE_LOADED, FILE_SAVED } from '../constants/ActionTypes'
import { file as defaultFile } from 'store/initialState'

export default function file (state = defaultFile, action) {
  switch (action.type) {
    case FILE_LOADED:
      saveToLocalStorage(action.fileName)
      return { fileName: action.fileName, loaded: true, dirty: false }

    case FILE_SAVED:
      return Object.assign({}, state, {dirty: false})

    default:
      return Object.assign({}, state, {dirty: true})
  }
}

function saveToLocalStorage (fileName) {
  window.localStorage.setItem('recentFileName', fileName)
}

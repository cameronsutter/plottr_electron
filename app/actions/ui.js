import { CHANGE_CURRENT_VIEW, FILE_LOADED } from '../constants/ActionTypes'

export function changeCurrentView (view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function loadFile (fileName, payload) {
  return { type: FILE_LOADED, fileName: fileName, data: payload }
}

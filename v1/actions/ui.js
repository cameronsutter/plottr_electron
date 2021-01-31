import {
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  FILE_LOADED,
  FILE_SAVED,
  NEW_FILE,
  EDIT_STORY_NAME,
} from '../constants/ActionTypes'

export function changeCurrentView(view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function changeOrientation(orientation) {
  return { type: CHANGE_ORIENTATION, orientation }
}

export function loadFile(fileName, dirty, payload, version) {
  return { type: FILE_LOADED, data: payload, fileName, dirty, version }
}

export function newFile(fileName) {
  return { type: NEW_FILE, fileName }
}

export function fileSaved(version) {
  return { type: FILE_SAVED, dirty: false, version }
}

export function changeStoryName(newName) {
  return { type: EDIT_STORY_NAME, name: newName }
}

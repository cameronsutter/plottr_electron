import { CHANGE_CURRENT_VIEW, FILE_LOADED, FILE_SAVED, NEW_FILE, EDIT_STORY_NAME } from 'constants/ActionTypes'

export function changeCurrentView (view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function loadFile (fileName, dirty, payload) {
  return { type: FILE_LOADED, data: payload, fileName, dirty }
}

export function newFile (fileName) {
  return { type: NEW_FILE, fileName }
}

export function fileSaved () {
  return { type: FILE_SAVED, dirty: false }
}

export function changeStoryName (newName) {
  return { type: EDIT_STORY_NAME, name: newName }
}

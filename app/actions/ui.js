import { CHANGE_CURRENT_VIEW, FILE_LOADED, EDIT_STORY_NAME } from 'constants/ActionTypes'

export function changeCurrentView (view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function loadFile (fileName, payload) {
  return { type: FILE_LOADED, fileName: fileName, data: payload }
}

export function changeStoryName (newName) {
  return { type: EDIT_STORY_NAME, name: newName }
}

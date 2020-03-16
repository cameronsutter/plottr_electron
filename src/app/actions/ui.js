import { CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION, FILE_LOADED,
  FILE_SAVED, NEW_FILE, SET_DARK_MODE,
  SET_CHARACTER_SORT, SET_PLACE_SORT, SET_CHARACTER_FILTER,
  SET_PLACE_FILTER, INCREASE_ZOOM, DECREASE_ZOOM, FIT_ZOOM, RESET_ZOOM } from 'constants/ActionTypes'

export function changeCurrentView (view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function changeOrientation (orientation) {
  return { type: CHANGE_ORIENTATION, orientation }
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

export function setDarkMode (on) {
  return { type: SET_DARK_MODE, on }
}

export function setCharacterSort (attr, direction) {
  return { type: SET_CHARACTER_SORT, attr, direction }
}

export function setPlaceSort (attr, direction) {
  return { type: SET_PLACE_SORT, attr, direction }
}

export function setNoteSort (attr, direction) {
  return { type: SET_NOTE_SORT, attr, direction }
}

export function setCharacterFilter (filter) {
  return { type: SET_CHARACTER_FILTER, filter }
}

export function setPlaceFilter (filter) {
  return { type: SET_PLACE_FILTER, filter }
}

export function setNoteFilter (filter) {
  return { type: SET_NOTE_FILTER, filter }
}

export function increaseZoom () {
  return { type: INCREASE_ZOOM }
}

export function decreaseZoom () {
  return { type: DECREASE_ZOOM }
}

export function fitZoom () {
  return { type: FIT_ZOOM }
}

export function resetZoom () {
  return { type: RESET_ZOOM }
}


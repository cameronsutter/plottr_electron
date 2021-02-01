import {
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  FILE_LOADED,
  NAVIGATE_TO_BOOK_TIMELINE,
  FILE_SAVED,
  NEW_FILE,
  SET_DARK_MODE,
  CHANGE_CURRENT_TIMELINE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  SET_CHARACTER_SORT,
  SET_PLACE_SORT,
  SET_CHARACTER_FILTER,
  EXPAND_TIMELINE,
  COLLAPSE_TIMELINE,
  SET_TIMELINE_FILTER,
  SET_PLACE_FILTER,
  INCREASE_ZOOM,
  DECREASE_ZOOM,
  FIT_ZOOM,
  RESET_ZOOM,
  RESET_TIMELINE,
  RECORD_SCROLL_POSITION,
  EDIT_FILENAME,
  SET_TIMELINE_SIZE,
  OPEN_ATTRIBUTES_DIALOG,
  CLOSE_ATTRIBUTES_DIALOG,
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

export function fileSaved() {
  return { type: FILE_SAVED, dirty: false }
}

export function setDarkMode(on) {
  return { type: SET_DARK_MODE, on }
}

export function setCharacterSort(attr, direction) {
  return { type: SET_CHARACTER_SORT, attr, direction }
}

export function setPlaceSort(attr, direction) {
  return { type: SET_PLACE_SORT, attr, direction }
}

export function setNoteSort(attr, direction) {
  return { type: SET_NOTE_SORT, attr, direction }
}

export function setCharacterFilter(filter) {
  return { type: SET_CHARACTER_FILTER, filter }
}

export function setPlaceFilter(filter) {
  return { type: SET_PLACE_FILTER, filter }
}

export function setNoteFilter(filter) {
  return { type: SET_NOTE_FILTER, filter }
}

export function setTimelineFilter(filter) {
  return { type: SET_TIMELINE_FILTER, filter }
}

export function increaseZoom() {
  return { type: INCREASE_ZOOM }
}

export function decreaseZoom() {
  return { type: DECREASE_ZOOM }
}

export function fitZoom() {
  return { type: FIT_ZOOM }
}

export function resetZoom() {
  return { type: RESET_ZOOM }
}

export function changeCurrentTimeline(id) {
  return { type: CHANGE_CURRENT_TIMELINE, id }
}

export function navigateToBookTimeline(bookId) {
  return { type: NAVIGATE_TO_BOOK_TIMELINE, bookId }
}

export function expandTimeline() {
  return { type: EXPAND_TIMELINE }
}

export function collapseTimeline() {
  return { type: COLLAPSE_TIMELINE }
}

export function clearTemplateFromTimeline(bookId, templateId) {
  return { type: CLEAR_TEMPLATE_FROM_TIMELINE, bookId, templateId }
}

export function resetTimeline(bookId) {
  return { type: RESET_TIMELINE, bookId }
}

export function recordScrollPosition({ x, y }) {
  return { type: RECORD_SCROLL_POSITION, x, y }
}

export function editFileName(newName) {
  return { type: EDIT_FILENAME, newName }
}

export function setTimelineSize(newSize) {
  return { type: SET_TIMELINE_SIZE, newSize }
}

export function openAttributesDialog() {
  return { type: OPEN_ATTRIBUTES_DIALOG }
}

export function closeAttributesDialog() {
  return { type: CLOSE_ATTRIBUTES_DIALOG }
}

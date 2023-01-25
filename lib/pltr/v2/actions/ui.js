import {
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  FILE_LOADED,
  NAVIGATE_TO_BOOK_TIMELINE,
  FILE_SAVED,
  NEW_FILE,
  CHANGE_CURRENT_TIMELINE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  SET_CHARACTER_SORT,
  SET_PLACE_SORT,
  SET_CHARACTER_FILTER,
  EXPAND_TIMELINE,
  COLLAPSE_TIMELINE,
  SET_TIMELINE_FILTER,
  SET_PLACE_FILTER,
  RESET_TIMELINE,
  RECORD_TIMELINE_SCROLL_POSITION,
  EDIT_FILENAME,
  SET_TIMELINE_SIZE,
  OPEN_ATTRIBUTES_DIALOG,
  CLOSE_ATTRIBUTES_DIALOG,
  SET_NOTE_SORT,
  SET_NOTE_FILTER,
  SET_OUTLINE_FILTER,
  SET_NOTES_FILTER,
  LOAD_UI,
  LOAD_FILE,
  SET_NOTES_SEARCH_TERM,
  SET_CHARACTERS_SEARCH_TERM,
  SET_PLACES_SEARCH_TERM,
  SET_TAGS_SEARCH_TERM,
  SET_OUTLINE_SEARCH_TERM,
  SET_TIMELINE_SEARCH_TERM,
  SET_ACTIVE_TIMELINE_TAB,
  SET_TIMELINE_VIEW,
  SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB,
  SELECT_CHARACTER,
  SET_CARD_DIALOG_OPEN,
  SET_CARD_DIALOG_CLOSE,
  OPEN_NEW_BOOK_DIALOG,
  OPEN_EDIT_BOOK_DIALOG,
  CLOSE_BOOK_DIALOG,
  RECORD_OUTLINE_SCROLL_POSITION,
  TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL,
} from '../constants/ActionTypes'
import { allCardsSelector } from '../selectors'
import { fileURLSelector } from '../selectors'

export function changeCurrentView(view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function changeOrientation(orientation) {
  return { type: CHANGE_ORIENTATION, orientation }
}

export function loadFile(fileName, dirty, payload, version, fileURL) {
  return { type: FILE_LOADED, data: payload, fileName, dirty, version, fileURL }
}

export function newFile(fileName) {
  return { type: NEW_FILE, fileName }
}

export function fileSaved() {
  return { type: FILE_SAVED, dirty: false }
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

export function setOutlineFilter(filter) {
  return { type: SET_OUTLINE_FILTER, filter }
}

export function changeCurrentTimeline(id) {
  return { type: CHANGE_CURRENT_TIMELINE, id }
}

export function navigateToBookTimeline(bookId, inBrowser, history) {
  if (inBrowser && history) {
    history.push(`/timeline`)
  }

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

export function recordTimelineScrollPosition({ x, y }) {
  return { type: RECORD_TIMELINE_SCROLL_POSITION, x, y }
}

export function recordOutlineScrollPosition(position) {
  return { type: RECORD_OUTLINE_SCROLL_POSITION, position }
}

export const editFileName = (persistFileNameChange, newName) => (dispatch, getState) => {
  // NOTE: Mobile doesn't use history middleware
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const fileURL = fileURLSelector(state)
  // TODO: dispatch an error for not being able to edit the file name.
  persistFileNameChange(fileURL, newName).then(() => {
    dispatch({ type: EDIT_FILENAME, newName })
  })
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

export function setNotesSearchTerm(searchTerm) {
  return { type: SET_NOTES_SEARCH_TERM, searchTerm }
}

export function setCharactersSearchTerm(searchTerm) {
  return { type: SET_CHARACTERS_SEARCH_TERM, searchTerm }
}

export function setPlacesSearchTerm(searchTerm) {
  return { type: SET_PLACES_SEARCH_TERM, searchTerm }
}

export function setTagsSearchTerm(searchTerm) {
  return { type: SET_TAGS_SEARCH_TERM, searchTerm }
}

export function setOutlineSearchTerm(searchTerm) {
  return { type: SET_OUTLINE_SEARCH_TERM, searchTerm }
}

export function setTimelineSearchTerm(searchTerm) {
  return { type: SET_TIMELINE_SEARCH_TERM, searchTerm }
}

export function patchFile(patching, file) {
  return { type: LOAD_FILE, patching, file }
}

export function setTimelineActiveTab(activeTab) {
  return { type: SET_ACTIVE_TIMELINE_TAB, activeTab }
}

export function setTimelineView(timelineView) {
  return { type: SET_TIMELINE_VIEW, timelineView }
}

export function selectCharacterAttributeBookTab(bookId) {
  return { type: SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB, bookId }
}

export function selectCharacter(id) {
  return { type: SELECT_CHARACTER, id }
}

export const setCardDialogOpen = (cardId, beatId, lineId) => (dispatch, getState) => {
  // NOTE: Mobile doesn't use history middleware
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const allCards = allCardsSelector(state)
  const cardExists = allCards.find((card) => card.id == cardId)
  if (cardExists) {
    dispatch({
      type: SET_CARD_DIALOG_OPEN,
      cardId,
      lineId,
      beatId,
    })
  }
}

export function setCardDialogClose() {
  return { type: SET_CARD_DIALOG_CLOSE }
}

export function openNewBookDialog() {
  return { type: OPEN_NEW_BOOK_DIALOG }
}

export function openEditBookDialog(bookId) {
  return {
    type: OPEN_EDIT_BOOK_DIALOG,
    bookId,
  }
}

export function closeBookDialog() {
  return { type: CLOSE_BOOK_DIALOG }
}

export function toggleAdvancedSaveTemplatePanel() {
  return { type: TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL }
}

export function load(patching, ui) {
  return { type: LOAD_UI, patching, ui }
}

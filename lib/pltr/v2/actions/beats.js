import {
  ADD_BEAT,
  EDIT_BEAT_TITLE,
  REORDER_BEATS,
  DELETE_BEAT,
  AUTO_SORT_BEAT,
  INSERT_BEAT,
} from '../constants/ActionTypes'
import { beat } from '../store/initialState'

export function addBeat(bookId, parentId) {
  return { type: ADD_BEAT, title: beat.title, bookId, parentId }
}

export function editBeatTitle(id, bookId, title) {
  return { type: EDIT_BEAT_TITLE, id, bookId, title }
}

export function reorderBeats(beatId, siblingToRight, bookId) {
  return { type: REORDER_BEATS, beatId, siblingToRight, bookId }
}

export function insertBeat(siblingToRight, bookId) {
  return { type: INSERT_BEAT, siblingToRight, bookId }
}

export function deleteBeat(id, bookId) {
  return { type: DELETE_BEAT, id, bookId }
}

export function autoSortBeat(id, bookId) {
  return { type: AUTO_SORT_BEAT, id, bookId }
}

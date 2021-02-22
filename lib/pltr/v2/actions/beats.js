import {
  ADD_BEAT,
  EDIT_BEAT_TITLE,
  REORDER_BEATS,
  DELETE_BEAT,
  AUTO_SORT_BEAT,
} from '../constants/ActionTypes'
import { beat } from '../store/initialState'

export function addBeat(bookId) {
  return { type: ADD_BEAT, title: beat.title, bookId }
}

export function editBeatTitle(id, bookId, title) {
  return { type: EDIT_BEAT_TITLE, id, bookId, title }
}

export function reorderBeats(beats, bookId) {
  return { type: REORDER_BEATS, beats, bookId }
}

export function deleteBeat(id, bookId) {
  return { type: DELETE_BEAT, id, bookId }
}

export function autoSortBeat(id) {
  return { type: AUTO_SORT_BEAT, id }
}

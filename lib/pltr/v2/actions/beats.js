import {
  ADD_BEAT,
  EDIT_BEAT_TITLE,
  REORDER_BEATS,
  DELETE_BEAT,
  AUTO_SORT_BEAT,
} from '../constants/ActionTypes'
import { beat } from '../store/initialState'

export function addBeat() {
  return { type: ADD_BEAT, title: beat.title }
}

export function editBeatTitle(id, title) {
  return { type: EDIT_BEAT_TITLE, id, title }
}

export function reorderBeats(beats) {
  return { type: REORDER_BEATS, beats }
}

export function deleteBeat(id) {
  return { type: DELETE_BEAT, id }
}

export function autoSortBeat(id) {
  return { type: AUTO_SORT_BEAT, id }
}

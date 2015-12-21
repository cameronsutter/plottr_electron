import { ADD_LINE, EDIT_LINE_TITLE, EDIT_LINE_COLOR, REORDER_LINES } from '../constants/ActionTypes'
import { line } from 'store/initialState'

export function addLine () {
  return { type: ADD_LINE, title: line.title, color: line.color }
}

export function editLineTitle (id, title) {
  return { type: EDIT_LINE_TITLE, id, title }
}

export function editLineColor (id, color) {
  return { type: EDIT_LINE_COLOR, id, color }
}

export function reorderLines (lines) {
  return { type: REORDER_LINES, lines }
}

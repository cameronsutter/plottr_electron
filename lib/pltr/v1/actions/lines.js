import {
  ADD_LINE,
  EDIT_LINE_TITLE,
  EDIT_LINE_COLOR,
  REORDER_LINES,
  DELETE_LINE,
} from '../constants/ActionTypes'

export function addLine() {
  return { type: ADD_LINE }
}

export function editLineTitle(id, title) {
  return { type: EDIT_LINE_TITLE, id, title }
}

export function editLineColor(id, color) {
  return { type: EDIT_LINE_COLOR, id, color }
}

export function reorderLines(lines) {
  return { type: REORDER_LINES, lines }
}

export function deleteLine(id) {
  return { type: DELETE_LINE, id }
}

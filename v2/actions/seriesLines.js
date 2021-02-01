import {
  ADD_SERIES_LINE,
  ADD_SERIES_LINES_FROM_TEMPLATE,
  EDIT_SERIES_LINE,
  EDIT_SERIES_LINE_TITLE,
  ADD_SERIES_LINE_WITH_TITLE,
  EDIT_SERIES_LINE_COLOR,
  REORDER_SERIES_LINES,
  DELETE_SERIES_LINE,
  EXPAND_SERIES_LINE,
  COLLAPSE_SERIES_LINE,
} from '../constants/ActionTypes'

// NOTE: needs to have the same signatures as the lines actions

export function addLine() {
  return { type: ADD_SERIES_LINE }
}

export function addLineWithTitle(title) {
  return { type: ADD_SERIES_LINE_WITH_TITLE, title }
}

export function addLinesFromTemplate(cards, lines) {
  return { type: ADD_SERIES_LINES_FROM_TEMPLATE, cards, lines }
}

export function editLine(id, title, color) {
  return { type: EDIT_SERIES_LINE, id, title, color }
}

export function editLineTitle(id, title) {
  return { type: EDIT_SERIES_LINE_TITLE, id, title }
}

export function editLineColor(id, color) {
  return { type: EDIT_SERIES_LINE_COLOR, id, color }
}

export function reorderLines(lines) {
  return { type: REORDER_SERIES_LINES, lines }
}

export function deleteLine(id) {
  return { type: DELETE_SERIES_LINE, id }
}

export function expandLine(id) {
  return { type: EXPAND_SERIES_LINE, id }
}

export function collapseLine(id) {
  return { type: COLLAPSE_SERIES_LINE, id }
}

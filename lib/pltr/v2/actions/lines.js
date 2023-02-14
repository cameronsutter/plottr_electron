import {
  ADD_LINE,
  ADD_LINE_WITH_TITLE,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_LINE,
  EDIT_LINE_TITLE,
  EDIT_LINE_COLOR,
  REORDER_LINES,
  DELETE_LINE,
  EXPAND_LINE,
  COLLAPSE_LINE,
  LOAD_LINES,
  DUPLICATE_LINE,
  MOVE_LINE,
  PIN_PLOTLINE,
  UNPIN_PLOTLINE,
} from '../constants/ActionTypes'
import { reorderList } from '../helpers/lists'
import {
  currentTimelineSelector,
  pinnedPlotlinesSelector,
  sortedLinesByBookSelector,
} from '../selectors'

// N.B. if one does not supply a book ID, then it is assumed that the
// action refers to the broadest scope possible, i.e. the series of
// books.

export function addLine(bookId) {
  return { type: ADD_LINE, bookId }
}

export function addLineWithTitle(title, bookId) {
  return { type: ADD_LINE_WITH_TITLE, title, bookId }
}

export function addLinesFromTemplate(templateData, id) {
  return { type: ADD_LINES_FROM_TEMPLATE, templateData, id }
}

export function editLine(id, title, color) {
  return { type: EDIT_LINE, id, title, color }
}

export function editLineTitle(id, title) {
  return { type: EDIT_LINE_TITLE, id, title }
}

export function editLineColor(id, color) {
  return { type: EDIT_LINE_COLOR, id, color }
}

export const reorderLines = (droppedPosition, originalPosition) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)
  const isConflictWithPinned = lines.find((line) => {
    if (line.position >= 0 && line.isPinned && line.position == droppedPosition) {
      return line
    }
  })
  const isPinnedPlotline = lines.find((line) => {
    if (line.position >= 0 && line.isPinned && line.position == originalPosition) {
      return line
    }
  })

  const bothPinned = lines.find((line) => {
    if (
      line.isPinned &&
      line.position >= 0 &&
      line.position == droppedPosition &&
      isPinnedPlotline &&
      isPinnedPlotline.position >= 0 &&
      isPinnedPlotline.position == originalPosition
    ) {
      return line
    }
  })

  if ((!bothPinned && isPinnedPlotline) || (!bothPinned && isConflictWithPinned)) {
    return false
  }

  const reorderedLines = reorderList(droppedPosition, originalPosition, lines)
  return dispatch({ type: REORDER_LINES, lines: reorderedLines, bookId })
}

export const togglePinPlotline = (line) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const pinnedPlotlines = pinnedPlotlinesSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)

  if (line?.id) {
    if (line?.isPinned) {
      const reorderedLines = reorderList(pinnedPlotlines - 1, line?.position, lines)
      return dispatch({ type: UNPIN_PLOTLINE, lineId: line.id, lines: reorderedLines, bookId })
    } else {
      const reorderedLines = reorderList(pinnedPlotlines, line?.position, lines)
      return dispatch({ type: PIN_PLOTLINE, lineId: line.id, lines: reorderedLines, bookId })
    }
  }
  return false
}

export function deleteLine(id, bookId) {
  return { type: DELETE_LINE, id, bookId }
}

export function expandLine(id) {
  return { type: EXPAND_LINE, id }
}

export function collapseLine(id) {
  return { type: COLLAPSE_LINE, id }
}

export function duplicateLine(id, position) {
  return { type: DUPLICATE_LINE, id, position }
}

export function load(patching, lines) {
  return { type: LOAD_LINES, patching, lines }
}

export function moveLine(id, destinationBookId) {
  return { type: MOVE_LINE, id, destinationBookId }
}

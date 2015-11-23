import { ADD_LINE, EDIT_LINE_TITLE, EDIT_LINE_COLOR } from '../constants/ActionTypes'
import { line } from 'store/initialState'

export function addLine () {
  return { type: ADD_LINE, title: line.title, color: line.color }
}

export function editLineTitle (id, newTitle) {
  return { type: EDIT_LINE_TITLE, id, newTitle }
}

export function editLineColor (id, newColor) {
  return { type: EDIT_LINE_COLOR, id, newColor }
}

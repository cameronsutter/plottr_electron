import { EDIT_SERIES, LOAD_SERIES } from '../constants/ActionTypes'

export function editSeries(attributes) {
  return { type: EDIT_SERIES, attributes }
}

export function load(patching, series) {
  return { type: LOAD_SERIES, patching, series }
}

import { EDIT_SERIES } from '../constants/ActionTypes'

export function editSeries(attributes) {
  return { type: EDIT_SERIES, attributes }
}

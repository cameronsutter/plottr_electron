import { ADD_PLACE, EDIT_PLACE } from 'constants/ActionTypes'
import { place } from 'store/initialState'

export function addPlace () {
  return { type: ADD_PLACE, name: place.name, description: place.description }
}

export function editPlace (id, name, description, color) {
  return { type: EDIT_PLACE, id, name, description, color }
}

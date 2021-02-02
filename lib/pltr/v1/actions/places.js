import { ADD_PLACE, EDIT_PLACE, DELETE_PLACE } from '../constants/ActionTypes'
import { place } from '../store/initialState'

export function addPlace() {
  return { type: ADD_PLACE, name: place.name, description: place.description, notes: place.notes }
}

export function editPlace(id, attributes) {
  return { type: EDIT_PLACE, id, attributes }
}

export function deletePlace(id) {
  return { type: DELETE_PLACE, id }
}

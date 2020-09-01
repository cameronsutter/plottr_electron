import { ADD_PLACE, EDIT_PLACE, DELETE_PLACE, ADD_PLACE_WITH_VALUES } from '../constants/ActionTypes'
import { place } from '../store/initialState'

export function addPlace () {
  return { type: ADD_PLACE, name: place.name, description: place.description, notes: place.notes }
}

export function addPlaceWithValues (place) {
  return { type: ADD_PLACE_WITH_VALUES, place }
}

export function editPlace (id, attributes) {
  return { type: EDIT_PLACE, id, attributes }
}

export function deletePlace (id) {
  return { type: DELETE_PLACE, id }
}

import { ADD_PLACE, EDIT_PLACE_NAME, EDIT_PLACE_DESCRIPTION } from 'constants/ActionTypes'
import { place } from 'store/initialState'

export function addPlace () {
  return { type: ADD_PLACE, name: place.name, description: place.description }
}

export function editPlaceName (id, name) {
  return { type: EDIT_PLACE_NAME, id, name }
}

export function editPlaceDescription (id, description) {
  return { type: EDIT_PLACE_DESCRIPTION, id, description }
}

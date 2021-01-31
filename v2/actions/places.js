import {
  ADD_PLACE,
  EDIT_PLACE,
  DELETE_PLACE,
  ADD_PLACE_WITH_VALUES,
  ATTACH_TAG_TO_PLACE,
  ATTACH_BOOK_TO_PLACE,
  REMOVE_TAG_FROM_PLACE,
  REMOVE_BOOK_FROM_PLACE,
} from '../constants/ActionTypes'
import { place } from '../store/initialState'

export function addPlace() {
  return { type: ADD_PLACE, name: place.name, description: place.description, notes: place.notes }
}

export function addPlaceWithValues(place) {
  return { type: ADD_PLACE_WITH_VALUES, place }
}

export function editPlace(id, attributes) {
  return { type: EDIT_PLACE, id, attributes }
}

export function deletePlace(id) {
  return { type: DELETE_PLACE, id }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_PLACE, id, tagId }
}

export function addBook(id, bookId) {
  return { type: ATTACH_BOOK_TO_PLACE, id, bookId }
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_PLACE, id, tagId }
}

export function removeBook(id, bookId) {
  return { type: REMOVE_BOOK_FROM_PLACE, id, bookId }
}

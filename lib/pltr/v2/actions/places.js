import {
  ADD_PLACE,
  ADD_PLACE_WITH_VALUES,
  ATTACH_BOOK_TO_PLACE,
  ATTACH_TAG_TO_PLACE,
  DELETE_PLACE,
  DUPLICATE_PLACE,
  EDIT_PLACE,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  LOAD_PLACES,
  REMOVE_BOOK_FROM_PLACE,
  REMOVE_TAG_FROM_PLACE,
} from '../constants/ActionTypes'
import { editorMetadataIfPresent } from '../helpers/editors'
import { place } from '../store/initialState'

export function addPlace() {
  return { type: ADD_PLACE, name: place.name, description: place.description, notes: place.notes }
}

export function addPlaceWithValues(place) {
  return { type: ADD_PLACE_WITH_VALUES, place }
}

export function editPlace(id, attributes, editorPath, selection) {
  return { type: EDIT_PLACE, id, attributes, ...editorMetadataIfPresent(editorPath, selection) }
}

export function duplicatePlace(id) {
  return { type: DUPLICATE_PLACE, id }
}

export function editPlaceTemplateAttribute(id, templateId, name, value, editorPath, selection) {
  return {
    type: EDIT_PLACE_TEMPLATE_ATTRIBUTE,
    id,
    templateId,
    name,
    value,
    ...editorMetadataIfPresent(editorPath, selection),
  }
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

export function load(patching, places) {
  return { type: LOAD_PLACES, patching, places }
}

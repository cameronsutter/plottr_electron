import { ADD_IMAGE, RENAME_IMAGE, DELETE_IMAGE, LOAD_IMAGES } from '../constants/ActionTypes'
import { image as initialImage } from '../store/initialState'

export function addImage(newImage) {
  const image = Object.assign({}, initialImage, newImage)
  return { type: ADD_IMAGE, image }
}

export function renameImage(id, name) {
  return { type: RENAME_IMAGE, id, name }
}

export function deleteImage(id) {
  return { type: DELETE_IMAGE, id }
}

export function load(patching, images) {
  return { type: LOAD_IMAGES, patching, images }
}

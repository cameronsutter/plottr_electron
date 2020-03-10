import { ADD_IMAGE, DELETE_IMAGE } from 'constants/ActionTypes'
import { image as initialImage } from 'store/initialState'

export function addImage (newImage) {
  const image = Object.assign({}, initialImage, newImage)
  return { type: ADD_IMAGE, image }
}

export function deleteImage (id) {
  return { type: DELETE_IMAGE, id }
}

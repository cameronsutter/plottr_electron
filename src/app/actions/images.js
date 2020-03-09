import { ADD_IMAGE } from 'constants/ActionTypes'
import { image as initialImage } from 'store/initialState'

export function addImage (newImage) {
  const image = Object.assign({}, initialImage, newImage)
  return { type: ADD_IMAGE, image }
}

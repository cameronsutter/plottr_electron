import { get } from 'lodash'

export const fileNameSelector = (state) => get(state, 'file.fileName')
export const fileIsLoadedSelector = (state) => get(state, 'file.loaded')
export const originalFileNameSelector = (state) => get(state, 'file.originalFileName')
export const cloudFilePathSelector = (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.isCloudFile ? `plottr://${file.id}` : null
}
export const filePathSelector = (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.isCloudFile ? `plottr://${file.id}` : file.fileName
}
export const fileIdSelector = (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.id
}

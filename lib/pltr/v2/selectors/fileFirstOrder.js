// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { get } from 'lodash'

export const fileNameSelector = (state) => get(state, 'file.fileName')
export const originalFileNameSelector = (state) => get(state, 'file.originalFileName')
export const cloudFilePathSelector = (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.isCloudFile ? `plottr://${file.id}` : null
}
export const fileIdSelector = (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.id
}

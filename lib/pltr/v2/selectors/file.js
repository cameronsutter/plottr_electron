export const fileNameSelector = (state) => state.file.fileName
export const fileIsLoadedSelector = (state) => state.file.loaded
export const originalFileNameSelector = (state) => state.file.originalFileName
export const cloudFilePathSelector = (state) =>
  state.file.isCloudFile ? `plottr://${state.file.id}` : null
export const filePathSelector = (state) =>
  state.file.isCloudFile ? `plottr://${state.file.id}` : state.file.fileName
export const fileIdSelector = (state) => state.file.id

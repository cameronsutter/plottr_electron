export const fileListSelector = (state) => state.project.fileList
export const selectedFileSelector = (state) => state.project.selectedFile
export const loadingFileSelector = (state) => state.project.isLoading
export const selectedFileIdSelector = (state) =>
  state.project && state.project.selectedFile && state.project.selectedFile.id
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded
export const isCloudFileSelector = (state) =>
  (state.project && state.project.selectedFile && state.project.selectedFile.isCloudFile) ||
  state.file.isCloudFile
export const isOfflineSelector = (state) => state.project.isOffline
export const isResumingSelector = (state) => state.project.resuming

export const fileListSelector = (state) => state.project.fileList
export const selectedFileSelector = (state) => state.project.selectedFile
export const selectedFileIdSelector = (state) =>
  state.project && state.project.selectedFile && state.project.selectedFile.id
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded

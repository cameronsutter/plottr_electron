export const fileListSelector = (state) => state.project.fileList
export const selectedFileSelector = (state) => state.project.selectedFile
export const selectedFileIdSelector = (state) =>
  state.project.selectedFile && state.project.selectedFile.id

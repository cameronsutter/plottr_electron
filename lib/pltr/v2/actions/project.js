import { SELECT_FILE, SET_FILE_LIST, SET_USERNAME_SEARCH_RESULTS } from '../constants/ActionTypes'

export const withFullFileState = (cb) => (dispatch, getState) => {
  cb(getState())
}

export const setFileList = (fileList) => ({
  type: SET_FILE_LIST,
  fileList,
})

export const selectFile = (selectedFile) => ({
  type: SELECT_FILE,
  selectedFile,
})

import {
  SELECT_FILE,
  SELECT_EMPTY_FILE,
  SET_FILE_LIST,
  SET_USERNAME_SEARCH_RESULTS,
  SET_FILE_LOADED,
  SHOW_LOADER,
  UNSET_FILE_LOADED,
  SET_OFFLINE,
} from '../constants/ActionTypes'

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

export const selectEmptyFile = () => ({
  type: SELECT_EMPTY_FILE,
})

export const setFileLoaded = () => ({
  type: SET_FILE_LOADED,
})

export const unsetFileLoaded = () => ({
  type: UNSET_FILE_LOADED,
})

export const showLoader = (isLoading) => ({
  type: SHOW_LOADER,
  isLoading,
})

export const setOffline = (isOffline) => ({
  type: SET_OFFLINE,
  isOffline,
})

import {
  SET_FILE_LIST,
  SELECT_FILE,
  SELECT_EMPTY_FILE,
  SET_FILE_LOADED,
  SHOW_LOADER,
  UNSET_FILE_LOADED,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  fileList: [],
  selectedFile: null,
  userNameSearchResults: [],
  fileLoaded: false,
  isLoading: false,
}

const NEW_FILE = { fileName: 'New file', none: true, id: -1 }

const projectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_FILE_LIST:
      return {
        ...state,
        fileList: action.fileList,
      }
    case SELECT_FILE:
      return {
        ...state,
        selectedFile: action.selectedFile,
        fileLoaded: false,
      }
    case SELECT_EMPTY_FILE:
      return {
        ...state,
        selectedFile: NEW_FILE,
      }
    case SET_FILE_LOADED:
      return {
        ...state,
        fileLoaded: true,
      }
    case UNSET_FILE_LOADED:
      return {
        ...state,
        fileLoaded: false,
      }
    case SHOW_LOADER:
      return {
        ...state,
        isLoading: action.isLoading,
      }
    default:
      return state
  }
}

export default projectReducer

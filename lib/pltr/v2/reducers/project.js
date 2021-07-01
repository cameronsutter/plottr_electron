import { SET_FILE_LIST, SELECT_FILE } from '../constants/ActionTypes'

const INITIAL_STATE = {
  fileList: [],
  selectedFile: null,
  userNameSearchResults: [],
}

const projectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_FILE_LIST:
      return {
        ...state,
        fileList: [{ fileName: 'New file', none: true, id: -1 }, ...action.fileList],
      }
    case SELECT_FILE:
      return {
        ...state,
        selectedFile: action.selectedFile,
      }
    default:
      return state
  }
}

export default projectReducer

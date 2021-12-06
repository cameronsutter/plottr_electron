import {
  SET_FILE_LIST,
  SELECT_FILE,
  SELECT_EMPTY_FILE,
  SET_FILE_LOADED,
  SHOW_LOADER,
  UNSET_FILE_LOADED,
  SET_OFFLINE,
  SET_RESUMING,
  SET_CHECKING_FOR_OFFLINE_DRIFT,
  SET_OVERWRITING_CLOUD_WITH_BACKUP,
  SET_SHOW_RESUME_MESSAGE_DIALOG,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  fileList: [],
  selectedFile: null,
  userNameSearchResults: [],
  fileLoaded: false,
  isLoading: false,
  isOffline: false,
  resuming: false,
  checkingOfflineDrift: false,
  overwritingCloudWithBackup: false,
  showResumeMessageDialog: false,
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
    case SET_OFFLINE:
      return {
        ...state,
        isOffline: action.isOffline,
      }
    case SET_RESUMING:
      return {
        ...state,
        resuming: action.resuming,
      }
    case SET_CHECKING_FOR_OFFLINE_DRIFT:
      return {
        ...state,
        checkingOfflineDrift: action.checkingOfflineDrift,
      }
    case SET_OVERWRITING_CLOUD_WITH_BACKUP:
      return {
        ...state,
        overwritingCloudWithBackup: action.overwritingCloudWithBackup,
      }
    case SET_SHOW_RESUME_MESSAGE_DIALOG:
      return {
        ...state,
        showResumeMessageDialog: action.showResumeMessageDialog,
      }
    default:
      return state
  }
}

export default projectReducer

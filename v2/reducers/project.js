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
  SET_BACKING_UP_OFFLINE_FILE,
  START_CREATING_NEW_PROJECT,
  FINISH_CREATING_NEW_PROJECT,
  EDIT_FILENAME,
  FILE_LOADED,
  FILE_SAVED,
} from '../constants/ActionTypes'
import { urlPointsToPlottrCloud } from '../helpers/file'
import { SYSTEM_REDUCER_ACTION_TYPES } from '../reducers/systemReducers'

const INITIAL_STATE = {
  selectedFile: null,
  fileURL: null,
  userNameSearchResults: [],
  fileLoaded: false,
  isLoading: false,
  isOffline: false,
  resuming: false,
  checkingOfflineDrift: false,
  overwritingCloudWithBackup: false,
  showResumeMessageDialog: false,
  backingUpOfflineFile: false,
  unsavedChanges: false,
}

const NEW_FILE = { fileName: 'New file', id: -1 }

const projectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SELECT_FILE: {
      // FIXME: this is set from knownFiles sometimes and from the
      // current file's file record others.  It should only come from
      // known files in the future.
      return {
        ...state,
        selectedFile: action.selectedFile,
        fileURL: action.selectedFile === null ? null : state.fileURL,
        fileLoaded: false,
      }
    }
    case SELECT_EMPTY_FILE:
      return {
        ...state,
        fileURL: null,
        selectedFile: null,
      }
    case SET_FILE_LOADED:
      return {
        ...state,
        fileLoaded: true,
        unsavedChanges: false,
      }
    case UNSET_FILE_LOADED:
      return {
        ...state,
        fileURL: null,
        fileLoaded: false,
        unsavedChanges: false,
      }
    case SHOW_LOADER:
      return {
        ...state,
        isLoading: action.isLoading,
      }
    case SET_OFFLINE: {
      if (action.isOffline) {
        return {
          ...state,
          isOffline: true,
          resuming: false,
        }
      } else {
        return {
          ...state,
          isOffline: false,
          resuming:
            state.isOffline &&
            action.offlineModeIsEnabled &&
            action.fileIsLoaded &&
            urlPointsToPlottrCloud(state.fileURL),
        }
      }
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
    case SET_BACKING_UP_OFFLINE_FILE:
      return {
        ...state,
        backingUpOfflineFile: action.backingUpOfflineFile,
      }
    case START_CREATING_NEW_PROJECT:
      return {
        ...state,
        projectNamingModalIsVisible: true,
        template: action.template,
        defaultName: action.defaultName,
      }
    case FINISH_CREATING_NEW_PROJECT:
      return {
        ...state,
        projectNamingModalIsVisible: false,
        template: null,
        defaultName: null,
      }
    case FILE_LOADED: {
      return {
        ...state,
        fileURL: action.fileURL,
        unsavedChanges: false,
      }
    }
    case EDIT_FILENAME: {
      return {
        ...state,
        selectedFile: {
          ...state.selectedFile,
          fileName: action.newName,
        },
      }
    }
    case FILE_SAVED: {
      return {
        ...state,
        unsavedChanges: false,
      }
    }
    default: {
      if (SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) === -1) {
        return {
          ...state,
          unsavedChanges: true,
        }
      }

      return state
    }
  }
}

export default projectReducer

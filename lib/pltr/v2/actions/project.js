import {
  SELECT_FILE,
  SELECT_EMPTY_FILE,
  SET_FILE_LIST,
  SET_USERNAME_SEARCH_RESULTS,
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
  SET_FILE_URL,
} from '../constants/ActionTypes'
import { fileURLSelector } from '../selectors/project'
import { offlineModeEnabledSelector } from '../selectors/settings'

export const withFullFileState = (cb) => (dispatch, getState) => {
  cb(getState())
}

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

export const setOffline = (isOffline) => (dispatch, getState) => {
  const state = getState().present
  const offlineModeIsEnabled = offlineModeEnabledSelector(state)
  const fileIsLoaded = !!fileURLSelector(state)

  dispatch({
    type: SET_OFFLINE,
    isOffline,
    offlineModeIsEnabled,
    fileIsLoaded,
  })
}

export const setResuming = (resuming) => ({
  type: SET_RESUMING,
  resuming,
})

export const setCheckingForOfflineDrift = (checkingOfflineDrift) => ({
  type: SET_CHECKING_FOR_OFFLINE_DRIFT,
  checkingOfflineDrift,
})

export const setOverwritingCloudWithBackup = (overwritingCloudWithBackup) => ({
  type: SET_OVERWRITING_CLOUD_WITH_BACKUP,
  overwritingCloudWithBackup,
})

export const setShowResumeMessageDialog = (showResumeMessageDialog) => ({
  type: SET_SHOW_RESUME_MESSAGE_DIALOG,
  showResumeMessageDialog,
})

export const setBackingUpOfflineFile = (backingUpOfflineFile) => ({
  type: SET_BACKING_UP_OFFLINE_FILE,
  backingUpOfflineFile,
})

export const startCreatingNewProject = (template, defaultName) => ({
  type: START_CREATING_NEW_PROJECT,
  template,
  defaultName,
})

export const finishCreatingNewProject = () => ({
  type: FINISH_CREATING_NEW_PROJECT,
})

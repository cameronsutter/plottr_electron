import {
  ADVANCE_PRO_ONBOARDING,
  FINISH_CHECKING_FILE_TO_LOAD,
  FINISH_CHECKING_SESSION,
  FINISH_CREATING_CLOUD_FILE,
  FINISH_DELETING_FILE,
  FINISH_LOADING_A_LICENSE_TYPE,
  FINISH_LOADING_A_SETTINGS_TYPE,
  FINISH_LOADING_FILE,
  ERROR_LOADING_FILE,
  FINISH_LOADING_FILE_LIST,
  FINISH_LOGGING_IN,
  FINISH_ONBOARDING,
  FINISH_RENAMING_FILE,
  FINISH_SAVING_FILE_AS,
  FINISH_UPLOADING_FILE_TO_CLOUD,
  START_CHECKING_FILE_TO_LOAD,
  START_CHECKING_SESSION,
  START_CREATING_CLOUD_FILE,
  START_DELETING_FILE,
  START_IMPORTING_SCRIVENER,
  FINISH_IMPORTING_SCRIVENER,
  START_LOADING_A_LICENSE_TYPE,
  START_LOADING_A_SETTINGS_TYPE,
  START_LOADING_FILE,
  START_LOADING_FILE_LIST,
  START_LOGGING_IN,
  START_ONBOARDING,
  START_ONBOARDING_FROM_ROOT,
  START_RENAMING_FILE,
  START_SAVING_FILE_AS,
  START_UPLOADING_FILE_TO_CLOUD,
  PROMPT_TO_UPLOAD_FILE,
  DISMISS_PROMPT_TO_UPLOAD_FILE,
  REQUEST_CHECK_FOR_UPDATE,
  PROCESS_RESPONSE_TO_REQUEST_UPDATE,
  DISMISS_UPDATE_NOTIFIER,
  SET_UPDATE_DOWNLOAD_PROGRESS,
  AUTO_CHECK_FOR_UPDATES,
  BUSY_WITH_WORK_THAT_PREVENTS_QUITTING,
  DONE_WITH_WORK_THAT_PREVENTS_QUITTING,
  CLEAR_ERROR_LOADING_FILE,
} from '../constants/ActionTypes'

// Project states
export const startLoadingFileList = () => ({
  type: START_LOADING_FILE_LIST,
})
export const finishLoadingFileList = () => ({
  type: FINISH_LOADING_FILE_LIST,
})

// File states
export const startCheckingFileToLoad = () => ({
  type: START_CHECKING_FILE_TO_LOAD,
})
export const finishCheckingFileToLoad = () => ({
  type: FINISH_CHECKING_FILE_TO_LOAD,
})
export const startCreatingCloudFile = () => ({
  type: START_CREATING_CLOUD_FILE,
})
export const finishCreatingCloudFile = () => ({
  type: FINISH_CREATING_CLOUD_FILE,
})
export const startUploadingFileToCloud = () => ({
  type: START_UPLOADING_FILE_TO_CLOUD,
})
export const finishUploadingFileToCloud = () => ({
  type: FINISH_UPLOADING_FILE_TO_CLOUD,
})
export const startLoadingFile = () => ({
  type: START_LOADING_FILE,
})
export const finishLoadingFile = () => ({
  type: FINISH_LOADING_FILE,
})
export const errorLoadingFile = (needToUpdate) => ({
  type: ERROR_LOADING_FILE,
  errorIsUpdateError: needToUpdate,
})
export const clearErrorLoadingFile = () => ({
  type: CLEAR_ERROR_LOADING_FILE,
})
export const startRenamingFile = () => ({
  type: START_RENAMING_FILE,
})
export const finishRenamingFile = () => ({
  type: FINISH_RENAMING_FILE,
})
export const startDeletingFile = () => ({
  type: START_DELETING_FILE,
})
export const finishDeletingFile = () => ({
  type: FINISH_DELETING_FILE,
})
export const startSavingFileAs = () => ({
  type: START_SAVING_FILE_AS,
})
export const finishSavingFileAs = () => ({
  type: FINISH_SAVING_FILE_AS,
})

// Session states
export const startLoggingIn = () => ({
  type: START_LOGGING_IN,
})
export const finishLoggingIn = () => ({
  type: FINISH_LOGGING_IN,
})
export const startCheckingSession = () => ({
  type: START_CHECKING_SESSION,
})
export const finishCheckingSession = () => ({
  type: FINISH_CHECKING_SESSION,
})

// License states
export const startLoadingALicenseType = (licenseType) => ({
  type: START_LOADING_A_LICENSE_TYPE,
  licenseType,
})
export const finishLoadingALicenseType = (licenseType) => ({
  type: FINISH_LOADING_A_LICENSE_TYPE,
  licenseType,
})

// Settings states
export const startLoadingASettingsType = (settingsType) => ({
  type: START_LOADING_A_SETTINGS_TYPE,
  settingsType,
})
export const finishLoadingASettingsType = (settingsType) => ({
  type: FINISH_LOADING_A_SETTINGS_TYPE,
  settingsType,
})

// Pro Onboarding
export const advanceProOnboarding = () => ({
  type: ADVANCE_PRO_ONBOARDING,
})
export const startProOnboarding = () => ({
  type: START_ONBOARDING,
})
export const finishProOnboarding = () => ({
  type: FINISH_ONBOARDING,
})
export const startProOnboardingFromRoot = () => ({
  type: START_ONBOARDING_FROM_ROOT,
})

// Import
export const startScrivenerImporter = () => ({
  type: START_IMPORTING_SCRIVENER,
})

export const finishScrivenerImporter = () => ({
  type: FINISH_IMPORTING_SCRIVENER,
})

export const promptToUploadFile = (filePath) => ({
  type: PROMPT_TO_UPLOAD_FILE,
  filePath,
})

export const dismissPromptToUploadFile = () => ({
  type: DISMISS_PROMPT_TO_UPLOAD_FILE,
})

// Updates
export const requestCheckForUpdates = () => ({
  type: REQUEST_CHECK_FOR_UPDATE,
})

export const autoCheckForUpdates = () => ({
  type: AUTO_CHECK_FOR_UPDATES,
})

export const processResponseToRequestUpdate = (available, error, info) => ({
  type: PROCESS_RESPONSE_TO_REQUEST_UPDATE,
  available,
  error,
  info,
})

export const dismissUpdateNotifier = () => ({
  type: DISMISS_UPDATE_NOTIFIER,
})

export const setUpdateDownloadProgress = (percent) => ({
  type: SET_UPDATE_DOWNLOAD_PROGRESS,
  percent,
})

export const startWorkThatPreventsQuitting = () => ({
  type: BUSY_WITH_WORK_THAT_PREVENTS_QUITTING,
})

export const finishWorkThatPreventsQuitting = () => ({
  type: DONE_WITH_WORK_THAT_PREVENTS_QUITTING,
})

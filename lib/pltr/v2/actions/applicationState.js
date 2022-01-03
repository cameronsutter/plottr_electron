import {
  FINISH_CREATING_CLOUD_FILE,
  FINISH_DELETING_FILE,
  FINISH_LOADING_A_LICENSE_TYPE,
  FINISH_LOADING_A_SETTINGS_TYPE,
  FINISH_LOADING_FILE,
  FINISH_LOADING_FILE_LIST,
  FINISH_LOGGING_IN,
  FINISH_RENAMING_FILE,
  FINISH_UPLOADING_FILE_TO_CLOUD,
  START_CREATING_CLOUD_FILE,
  START_DELETING_FILE,
  START_LOADING_A_LICENSE_TYPE,
  START_LOADING_A_SETTINGS_TYPE,
  START_LOADING_FILE,
  START_LOADING_FILE_LIST,
  START_LOGGING_IN,
  START_RENAMING_FILE,
  START_UPLOADING_FILE_TO_CLOUD,
} from '../constants/ActionTypes'

// Project states
export const startLoadingFileList = () => ({
  type: START_LOADING_FILE_LIST,
})
export const finishLoadingFileList = () => ({
  type: FINISH_LOADING_FILE_LIST,
})

// File states
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

// Session states
export const startLoggingIn = () => ({
  type: START_LOGGING_IN,
})
export const finishLoggingIn = () => ({
  type: FINISH_LOGGING_IN,
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

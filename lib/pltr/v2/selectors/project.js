import { createSelector } from 'reselect'
import { isDeviceFileURL, urlPointsToPlottrCloud } from '../helpers/file'
import { isOnWebSelector } from './client'
import { backupEnabledSelector, localBackupsEnabledSelector, offlineModeEnabledSelector } from './settings'
import { emptyFile } from '../store/newFileState'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import { difference } from 'lodash'

export const projectSelector = (state) => state.project
export const selectedFileSelector = (state) => state.project.selectedFile
export const loadingFileSelector = (state) => state.project.isLoading
export const projectNamingModalIsVisibleSelector = (state) =>
  state.project.projectNamingModalIsVisible
export const newProjectTemplateSelector = (state) => state.project.template
export const selectedFileIdSelector = (state) =>
  state.project && state.project.selectedFile && state.project.selectedFile.id
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded
export const isCloudFileSelector = createSelector(
  projectSelector,
  isOnWebSelector,
  (project, isOnWeb) => {
    return isOnWeb || (project && project.fileURL && urlPointsToPlottrCloud(project.fileURL))
  }
)
export const isOfflineSelector = (state) => state.project && state.project.isOffline
export const isResumingSelector = (state) => state.project.resuming
export const isCheckingForOfflineDriftSelector = (state) => state.project.checkingOfflineDrift
export const isOverwritingCloudWithBackupSelector = (state) =>
  state.project.overwritingCloudWithBackup
export const showResumeMessageDialogSelector = (state) => state.project.showResumeMessageDialog
export const backingUpOfflineFileSelector = (state) => state.project.backingUpOfflineFile
export const fileURLSelector = (state) => state.project.fileURL
export const isDeviceFileSelector = createSelector(fileURLSelector, (fileURL) =>
  isDeviceFileURL(fileURL)
)
const emptyFileState = emptyFile('DummyFile', '2022.11.2')
export const hasAllKeysSelector = (state) => {
  const withoutSystemKeys = difference(Object.keys(state), SYSTEM_REDUCER_KEYS)
  return difference(Object.keys(emptyFileState), withoutSystemKeys).length === 0
}
export const canSaveSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  (fileURL, isResuming, isOffline, offlineModeEnabled, hasAllKeys) => {
    return !!fileURL && !isResuming && !(isOffline && !offlineModeEnabled) && hasAllKeys
  }
)
export const canBackupSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  localBackupsEnabledSelector,
  backupEnabledSelector,
  (
    fileURL,
    isResuming,
    isOffline,
    offlineModeEnabled,
    hasAllKeys,
    isCloudFile,
    localBackupsEnabled,
    backupEnabled
  ) => {
    return (
      backupEnabled &&
      !!fileURL &&
      !isResuming &&
      !(isOffline && isCloudFile) &&
      ((isCloudFile && localBackupsEnabled) || !isCloudFile) &&
      hasAllKeys
    )
  }
)
export const shouldSaveOfflineFileSelector = createSelector(
  canSaveSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  (canSave, isOffline, offlineModeEnabled) => {
    return canSave && isOffline && offlineModeEnabled
  }
)

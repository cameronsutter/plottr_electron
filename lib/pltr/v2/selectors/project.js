import { createSelector } from 'reselect'

export const fileListSelector = (state) => state.project.fileList
export const selectedFileSelector = (state) => state.project.selectedFile
export const loadingFileSelector = (state) => state.project.isLoading
export const selectedFileIdSelector = (state) =>
  state.project && state.project.selectedFile && state.project.selectedFile.id
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded
export const isCloudFileSelector = (state) =>
  (state.project && state.project.selectedFile && state.project.selectedFile.isCloudFile) ||
  state.file.isCloudFile
export const isOfflineSelector = (state) => state.project && state.project.isOffline
export const isResumingSelector = (state) => state.project.resuming
export const isCheckingForOfflineDriftSelector = (state) => state.project.checkingOfflineDrift
export const isOverwritingCloudWithBackupSelector = (state) =>
  state.project.overwritingCloudWithBackup
export const showResumeMessageDialogSelector = (state) => state.project.showResumeMessageDialog
const selectId = (state, id) => id
export const fileFromFileIdSelector = createSelector(
  fileListSelector,
  selectId,
  (fileList, fileId) => {
    return fileList.find(({ id }) => id === fileId)
  }
)
export const backingUpOfflineFileSelector = (state) => state.project.backingUpOfflineFile

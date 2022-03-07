import { createSelector } from 'reselect'
import { isOnWebSelector } from './client'

const fileSelector = (state) => state.file
export const projectSelector = (state) => state.project
export const selectedFileSelector = (state) => state.project.selectedFile
export const loadingFileSelector = (state) => state.project.isLoading
export const selectedFileIdSelector = (state) =>
  state.project && state.project.selectedFile && state.project.selectedFile.id
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded
export const isCloudFileSelector = createSelector(
  projectSelector,
  fileSelector,
  isOnWebSelector,
  (project, file, isOnWeb) =>
    isOnWeb ||
    (project && project.selectedFile && project.selectedFile.isCloudFile) ||
    file.isCloudFile
)
export const isOfflineSelector = (state) => state.project && state.project.isOffline
export const isResumingSelector = (state) => state.project.resuming
export const isCheckingForOfflineDriftSelector = (state) => state.project.checkingOfflineDrift
export const isOverwritingCloudWithBackupSelector = (state) =>
  state.project.overwritingCloudWithBackup
export const showResumeMessageDialogSelector = (state) => state.project.showResumeMessageDialog
export const backingUpOfflineFileSelector = (state) => state.project.backingUpOfflineFile

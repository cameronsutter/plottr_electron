import { createSelector } from 'reselect'
import { isLoggedInSelector } from './client'
import { loadingFileSelector as deprecatedLoadingFileSelector } from './project'
import { previouslyLoggedIntoProSelector } from './settings'

export const applicationStateSelector = (state) => state.applicationState

export const projectStateSelector = createSelector(
  applicationStateSelector,
  ({ project }) => project
)
export const fileListLoadedSelector = createSelector(
  projectStateSelector,
  ({ fileListLoaded }) => fileListLoaded
)
export const fileListIsLoadingSelector = createSelector(
  projectStateSelector,
  ({ loadingFileList }) => loadingFileList
)

export const applicationSettingsSelector = createSelector(
  applicationStateSelector,
  ({ settings }) => settings
)
export const applicationSettingsAreLoadedSelector = createSelector(
  applicationSettingsSelector,
  ({ settingsLoaded }) => settingsLoaded
)

export const fileStateSelector = createSelector(applicationStateSelector, ({ file }) => file)
export const fileIsLoadedSelector = createSelector(
  fileStateSelector,
  ({ fileLoaded }) => fileLoaded
)
export const isRenamingFileSelector = createSelector(
  fileStateSelector,
  ({ renamingFile }) => renamingFile
)
export const creatingCloudFileSelector = createSelector(
  fileStateSelector,
  ({ creatingCloudFile }) => creatingCloudFile
)
export const uploadingFileToCloudSelector = createSelector(
  fileStateSelector,
  ({ uploadingFileToCloud }) => uploadingFileToCloud
)
export const loadingFileSelector = createSelector(
  fileStateSelector,
  ({ loadingFile }) => loadingFile
)
export const deletingFileSelector = createSelector(
  fileStateSelector,
  ({ deletingFile }) => deletingFile
)

export const sessionStateSelector = createSelector(applicationStateSelector, ({ session }) => session)
export const sessionCheckedSelector = createSelector(sessionStateSelector, ({ sessionChecked }) => sessionChecked)
export const checkingSessionSelector = createSelector(sessionStateSelector, ({ checkingSession }) => checkingSession)

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  deprecatedLoadingFileSelector,
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  loadingFileSelector,
  fileIsLoadedSelector,
  deletingFileSelector,
  applicationSettingsAreLoadedSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
  (
    fileIsLoadingDeprecated,
    renamingFile,
    creatingCloudFile,
    uplodingFileToCloud,
    loadingFile,
    fileLoaded,
    deletingFile,
    applicationSettingsAreLoaded,
    sessionChecked,
    checkingSession
  ) =>
    fileIsLoadingDeprecated ||
    renamingFile ||
    creatingCloudFile ||
    uplodingFileToCloud ||
    loadingFile ||
    !fileLoaded ||
    deletingFile ||
    !applicationSettingsAreLoaded ||
    !sessionChecked ||
    checkingSession
)

export const userNeedsToLoginSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  previouslyLoggedIntoProSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
  isLoggedInSelector,
  (settingsAreLoaded, userLoggedIntoPro, sessionChecked, checkingSession, isLoggedIn) => {
    return settingsAreLoaded && userLoggedIntoPro && sessionChecked && !isLoggedIn
  }
)

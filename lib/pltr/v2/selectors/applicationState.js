import { createSelector } from 'reselect'
import { loadingFileSelector as deprecatedLoadingFileSelector } from './project'

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

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  deprecatedLoadingFileSelector,
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  loadingFileSelector,
  fileIsLoadedSelector,
  deletingFileSelector,
  applicationSettingsAreLoadedSelector,
  (
    fileIsLoadingDeprecated,
    renamingFile,
    creatingCloudFile,
    uplodingFileToCloud,
    loadingFile,
    fileLoaded,
    deletingFile,
    applicationSettingsAreLoaded
  ) =>
    fileIsLoadingDeprecated ||
    renamingFile ||
    creatingCloudFile ||
    uplodingFileToCloud ||
    loadingFile ||
    !fileLoaded ||
    deletingFile ||
    !applicationSettingsAreLoaded
)

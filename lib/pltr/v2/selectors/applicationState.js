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
export const applicationSettingsAreLoadingSelector = createSelector(
  applicationSettingsSelector,
  ({ loadingSettings }) => loadingSettings
)
export const exportConfigSettingsAreLoadedSelector = createSelector(
  applicationSettingsSelector,
  ({ exportConfigLoaded }) => exportConfigLoaded
)
export const exportConfigSettingsAreLoadingSelector = createSelector(
  applicationSettingsSelector,
  ({ loadingExportConfig }) => loadingExportConfig
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

export const sessionStateSelector = createSelector(
  applicationStateSelector,
  ({ session }) => session
)
export const sessionCheckedSelector = createSelector(
  sessionStateSelector,
  ({ sessionChecked }) => sessionChecked
)
export const checkingSessionSelector = createSelector(
  sessionStateSelector,
  ({ checkingSession }) => checkingSession
)

export const licenseStateSelector = createSelector(
  applicationStateSelector,
  ({ license }) => license
)
export const checkedTrialSelector = createSelector(
  licenseStateSelector,
  ({ trialLoaded }) => trialLoaded
)
export const checkingTrialSelector = createSelector(
  licenseStateSelector,
  ({ loadingTrial }) => loadingTrial
)
export const checkedLicenseSelector = createSelector(
  licenseStateSelector,
  ({ licenseLoaded }) => licenseLoaded
)
export const checkingLicenseSelector = createSelector(
  licenseStateSelector,
  ({ loadingLicense }) => loadingLicense
)
export const checkedProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ proSubscriptionChecked }) => proSubscriptionChecked
)
export const checkingProSubscriptionSelector = createSelector(
  licenseStateSelector,
  ({ checkingProSubscription }) => checkingProSubscription
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
  sessionCheckedSelector,
  checkingSessionSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
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
    checkingSession,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) =>
    fileIsLoadingDeprecated ||
    loadingFile ||
    !fileLoaded ||
    renamingFile ||
    creatingCloudFile ||
    uplodingFileToCloud ||
    deletingFile ||
    !applicationSettingsAreLoaded ||
    !sessionChecked ||
    checkingSession ||
    (previouslyLoggedIntoPro && !checkedProSubscription) ||
    // TODO: Web doesn't have trials or licenses to load.
    !checkedLicense ||
    !checkedTrial
)

export const userNeedsToLoginSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  previouslyLoggedIntoProSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  (settingsAreLoaded, userLoggedIntoPro, sessionChecked, isLoggedIn) => {
    return settingsAreLoaded && userLoggedIntoPro && sessionChecked && !isLoggedIn
  }
)

import { createSelector } from 'reselect'
import { hasProSelector, isLoggedInSelector } from './client'
import { hasLicenseSelector, isInTrialModeSelector } from './license'
import {
  isCloudFileSelector,
  loadingFileSelector as deprecatedLoadingFileSelector,
} from './project'
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
export const checkingFileToLoadSelector = createSelector(
  fileStateSelector,
  ({ checkingFileToLoad }) => checkingFileToLoad
)
export const checkedFileToLoadSelector = createSelector(
  fileStateSelector,
  ({ checkedFileToLoad }) => checkedFileToLoad
)
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

export const needToCheckProSubscriptionSelector = createSelector(
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  (previouslyLoggedIntoPro, checkedProSubscription) => {
    return previouslyLoggedIntoPro && !checkedProSubscription
  }
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
  isLoggedInSelector,
  checkingSessionSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  checkingFileToLoadSelector,
  checkedFileToLoadSelector,
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
    isLoggedIn,
    checkingSession,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial,
    checkingFileToLoad,
    checkedFileToLoad
  ) =>
    checkingFileToLoad ||
    !checkedFileToLoad ||
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
    (isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription) ||
    // TODO: Web doesn't have trials or licenses to load.
    !checkedLicense ||
    !checkedTrial
)

export const applicationIsBusyButFileCouldBeUnloadedSelector = createSelector(
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  loadingFileSelector,
  deletingFileSelector,
  applicationSettingsAreLoadedSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  checkingSessionSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  checkingFileToLoadSelector,
  (
    renamingFile,
    creatingCloudFile,
    uplodingFileToCloud,
    loadingFile,
    deletingFile,
    applicationSettingsAreLoaded,
    sessionChecked,
    isLoggedIn,
    checkingSession,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial,
    checkingFileToLoad
  ) =>
    checkingFileToLoad ||
    loadingFile ||
    renamingFile ||
    creatingCloudFile ||
    uplodingFileToCloud ||
    deletingFile ||
    !applicationSettingsAreLoaded ||
    !sessionChecked ||
    checkingSession ||
    (isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription) ||
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

export const isInSomeValidLicenseStateSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  sessionCheckedSelector,
  userNeedsToLoginSelector,

  needToCheckProSubscriptionSelector,
  hasProSelector,
  hasLicenseSelector,
  isInTrialModeSelector,
  (
    applicationSettingsAreLoaded,
    sessionChecked,
    needsToLogin,

    needToCheckProSubscription,
    hasPro,
    hasLicense,
    isInTrialMode
  ) => {
    return (
      applicationSettingsAreLoaded &&
      sessionChecked &&
      !needsToLogin &&
      !needToCheckProSubscription &&
      (hasPro || hasLicense || isInTrialMode)
    )
  }
)

export const cantShowFileSelector = createSelector(
  fileIsLoadedSelector,
  hasProSelector,
  isCloudFileSelector,
  (fileLoaded, hasActiveProSubscription, selectedFileIsACloudFile) => {
    return !fileLoaded || !!hasActiveProSubscription !== !!selectedFileIsACloudFile
  }
)

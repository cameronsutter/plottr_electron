import { createSelector } from 'reselect'
import { hasProSelector, isLoggedInSelector } from './client'
import { hasLicenseSelector, isInTrialModeSelector } from './license'
import {
  isCloudFileSelector,
  isOfflineSelector,
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

const busyLoadingFileOrNeedToLoadFileSelector = createSelector(
  deprecatedLoadingFileSelector,
  loadingFileSelector,
  fileIsLoadedSelector,
  (fileIsLoadingDeprecated, fileIsLoading, loadedAFileBefore) => {
    return fileIsLoadingDeprecated || fileIsLoading || !loadedAFileBefore
  }
)

const checkingWhatToLoadOrNeedToCheckWhatToLoadSelector = createSelector(
  checkingFileToLoadSelector,
  checkedFileToLoadSelector,
  (checkingFileToLoad, checkedFileToLoad) => {
    return checkingFileToLoad || !checkedFileToLoad
  }
)

const manipulatingAFileSelector = createSelector(
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  deletingFileSelector,
  (isRenamingFile, creatingCloudFile, uploadingFileToCloud, deletingFile) => {
    return isRenamingFile || creatingCloudFile || uploadingFileToCloud || deletingFile
  }
)

const checkingSessionOrNeedToCheckSessionSelector = createSelector(
  sessionCheckedSelector,
  checkingSessionSelector,
  (sessionChecked, checkingSession) => {
    return checkingSession || !sessionChecked
  }
)

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  busyLoadingFileOrNeedToLoadFileSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    busyLoadingFileOrNeedToLoadFile,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      busyLoadingFileOrNeedToLoadFile ||
      checkingWhatToLoadOrNeedToCheckWhatToLoad ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      checkingSessionOrNeedToCheckSession ||
      (isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const isInOfflineModeSelector = createSelector(
  isOfflineSelector,
  previouslyLoggedIntoProSelector,
  (isOffline, previouslyLoggedIntoPro) => {
    return isOffline && previouslyLoggedIntoPro
  }
)

export const applicationIsBusyButFileCouldBeUnloadedSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  isInOfflineModeSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    isInOfflineMode,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      checkingWhatToLoadOrNeedToCheckWhatToLoad ||
      loadingFile ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (!isInOfflineMode && checkingSessionOrNeedToCheckSession) ||
      (isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const loadingStateSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkingLicense,
    checkingTrial
  ) => {
    if (checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      return 'Locating document...'
    }
    if (loadingFile) {
      return 'Placing document on table...'
    }
    if (manipulatingAFile) {
      return 'Spilling ink on desk...'
    }
    if (!applicationSettingsAreLoaded) {
      return 'Loading settings...'
    }
    if (checkingSessionOrNeedToCheckSession) {
      return 'Security checkpoint...'
    }
    if (
      (isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription) ||
      checkingLicense ||
      checkingTrial
    ) {
      return 'Checking your ticket...'
    }
    return 'Done!'
  }
)

export const loadingProgressSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  previouslyLoggedIntoProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    previouslyLoggedIntoPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    let progress = 0
    if (!checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      progress++
    }
    if (!applicationSettingsAreLoaded) {
      progress++
    }
    if (!checkingSessionOrNeedToCheckSession) {
      progress++
    }
    if (!(isLoggedIn && previouslyLoggedIntoPro && !checkedProSubscription)) {
      progress++
    }
    if (checkedLicense) {
      progress++
    }
    if (checkedTrial) {
      progress++
    }
    return 100.0 * (progress / 6.0)
  }
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

  isInOfflineModeSelector,
  needToCheckProSubscriptionSelector,
  hasProSelector,
  hasLicenseSelector,
  isInTrialModeSelector,
  (
    applicationSettingsAreLoaded,
    sessionChecked,
    needsToLogin,

    isInOfflineMode,
    needToCheckProSubscription,
    hasPro,
    hasLicense,
    isInTrialMode
  ) => {
    return (
      applicationSettingsAreLoaded &&
      (isInOfflineMode ||
        (sessionChecked &&
          !needsToLogin &&
          !needToCheckProSubscription &&
          (hasPro || hasLicense || isInTrialMode)))
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

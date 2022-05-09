import { createSelector } from 'reselect'
import { hasProSelector, isLoggedInSelector } from './client'
import {
  hasLicenseSelector,
  isFirstTimeSelector,
  isInTrialModeSelector,
  isInTrialModeWithExpiredTrialSelector,
} from './license'
import {
  isCloudFileSelector,
  isOfflineSelector,
  isResumingSelector,
  loadingFileSelector as deprecatedLoadingFileSelector,
} from './project'
import { offlineModeEnabledSelector } from './settings'
import { shouldBeInProSelector } from './shouldBeInPro'

export { shouldBeInProSelector }

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

export const importingNewProjectSelector = createSelector(
  projectStateSelector,
  ({ isImportingNewProject }) => isImportingNewProject
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
export const savingFileAsSelector = createSelector(
  fileStateSelector,
  ({ savingFileAs }) => savingFileAs
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
export const isLoggingInSelector = createSelector(
  sessionStateSelector,
  ({ loggingIn }) => loggingIn
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

export const proOnboardingStateSelector = createSelector(
  applicationStateSelector,
  ({ proOnboarding }) => proOnboarding
)
export const currentProOnboardingStepSelector = createSelector(
  proOnboardingStateSelector,
  ({ onboardingStep }) => onboardingStep
)
export const isOnboardingToProSelector = createSelector(
  proOnboardingStateSelector,
  ({ isOnboarding }) => isOnboarding
)
export const isOnboardingToProFromRootSelector = createSelector(
  proOnboardingStateSelector,
  ({ isOnboardingFromRoot }) => isOnboardingFromRoot
)

export const needToCheckProSubscriptionSelector = createSelector(
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  (shouldBeInPro, checkedProSubscription) => {
    return shouldBeInPro && !checkedProSubscription
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

export const manipulatingAFileSelector = createSelector(
  isRenamingFileSelector,
  creatingCloudFileSelector,
  uploadingFileToCloudSelector,
  deletingFileSelector,
  savingFileAsSelector,
  (isRenamingFile, creatingCloudFile, uploadingFileToCloud, deletingFile, savingFileAs) => {
    return (
      isRenamingFile || creatingCloudFile || uploadingFileToCloud || deletingFile || savingFileAs
    )
  }
)

export const isInOfflineModeSelector = createSelector(
  isOfflineSelector,
  shouldBeInProSelector,
  offlineModeEnabledSelector,
  (isOffline, shouldBeInPro, offlineModeEnabled) => {
    return isOffline && shouldBeInPro && offlineModeEnabled
  }
)

const checkingSessionOrNeedToCheckSessionSelector = createSelector(
  sessionCheckedSelector,
  checkingSessionSelector,
  isInOfflineModeSelector,
  (sessionChecked, checkingSession, isInOfflineMode) => {
    return !isInOfflineMode && (checkingSession || !sessionChecked)
  }
)

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  busyLoadingFileOrNeedToLoadFileSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isOnboardingToProSelector,
  importingNewProjectSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    busyLoadingFileOrNeedToLoadFile,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isOnboardingToPro,
    isImportingNewProject,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      busyLoadingFileOrNeedToLoadFile ||
      checkingWhatToLoadOrNeedToCheckWhatToLoad ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (checkingSessionOrNeedToCheckSession && !isOnboardingToPro) ||
      isImportingNewProject ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const applicationIsBusyButFileCouldBeUnloadedSelector = createSelector(
  isFirstTimeSelector,
  isInTrialModeWithExpiredTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  isInOfflineModeSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    firstTime,
    isInTrialModeWithExpiredTrial,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    isInOfflineMode,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      // We only check what to load when we're in a valid license
      // state.  So we need to account for there being no license or
      // there being an expired trial.
      (!firstTime && !isInTrialModeWithExpiredTrial && checkingWhatToLoadOrNeedToCheckWhatToLoad) ||
      loadingFile ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (!isInOfflineMode && checkingSessionOrNeedToCheckSession) ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
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
  shouldBeInProSelector,
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
    shouldBeInPro,
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
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
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
  shouldBeInProSelector,
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
    shouldBeInPro,
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
    if (!(isLoggedIn && shouldBeInPro && !checkedProSubscription)) {
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
  shouldBeInProSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  (settingsAreLoaded, shouldBeInPro, sessionChecked, isLoggedIn) => {
    return settingsAreLoaded && shouldBeInPro && sessionChecked && !isLoggedIn
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
  isResumingSelector,
  isOfflineSelector,
  isInOfflineModeSelector,
  shouldBeInProSelector,
  (
    fileLoaded,
    hasActiveProSubscription,
    selectedFileIsACloudFile,
    isResuming,
    isOffline,
    isInOfflineMode,
    shouldBeInPro
  ) => {
    return (
      !isResuming &&
      (!fileLoaded ||
        (!isInOfflineMode && isOffline && shouldBeInPro) ||
        !!hasActiveProSubscription !== !!selectedFileIsACloudFile)
    )
  }
)

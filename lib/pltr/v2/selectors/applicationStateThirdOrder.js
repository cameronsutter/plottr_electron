import { createSelector } from 'reselect'

import { urlPointsToPlottrCloud } from '../helpers/file'

import {
  backupEnabledSelector,
  localBackupsEnabledSelector,
  offlineModeEnabledSelector,
} from './settingsFirstOrder'
import { hasProSelector, isLoggedInSelector, isOnWebSelector } from './clientFirstOrder'
import {
  applicationSettingsAreLoadedSelector,
  checkedLicenseSelector,
  checkedProSubscriptionSelector,
  checkedTrialSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  filePathToUploadSelector,
  importingNewProjectSelector,
  isOnboardingToProSelector,
  manipulatingAFileSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
  loadingFileSelector,
} from './applicationStateFirstOrder'
import {
  isOfflineSelector,
  isResumingSelector,
  fileURLSelector,
  hasAllKeysSelector,
  projectSelector,
} from './projectFirstOrder'
import { hasLicenseSelector, trialExpiredSelector, trialStartedSelector } from './licenseFirstOrder'
import { fileIsLoadedSelector } from './applicationStateFirstOrder'
import { shouldBeInProSelector } from './secondOrder'

export const userNeedsToLoginSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  shouldBeInProSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  (settingsAreLoaded, shouldBeInPro, sessionChecked, isLoggedIn) => {
    return settingsAreLoaded && shouldBeInPro && sessionChecked && !isLoggedIn
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

export const needToCheckProSubscriptionSelector = createSelector(
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  (shouldBeInPro, checkedProSubscription) => {
    return shouldBeInPro && !checkedProSubscription
  }
)

export const isInTrialModeSelector = createSelector(
  trialStartedSelector,
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  shouldBeInProSelector,
  (started, trialExpired, hasLicense, hasCurrentProLicense, shouldBeInPro) => {
    return started && !trialExpired && !hasLicense && !hasCurrentProLicense && !shouldBeInPro
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

export const readyToCheckFileToLoadSelector = createSelector(
  isInSomeValidLicenseStateSelector,
  filePathToUploadSelector,
  (inValidLicenseState, filePathToUpload) => {
    return !filePathToUpload && inValidLicenseState
  }
)

export const checkingSessionOrNeedToCheckSessionSelector = createSelector(
  sessionCheckedSelector,
  checkingSessionSelector,
  isInOfflineModeSelector,
  (sessionChecked, checkingSession, isInOfflineMode) => {
    return !isInOfflineMode && (checkingSession || !sessionChecked)
  }
)

export const busyLoadingFileOrNeedToLoadFileSelector = createSelector(
  loadingFileSelector,
  fileIsLoadedSelector,
  (fileIsLoading, loadedAFileBefore) => {
    return fileIsLoading || !loadedAFileBefore
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

export const isFirstTimeSelector = createSelector(
  hasLicenseSelector,
  trialStartedSelector,
  hasProSelector,
  shouldBeInProSelector,
  (hasLicense, trialStarted, hasCurrentProLicense, shouldBeInPro) => {
    return !hasLicense && !trialStarted && !hasCurrentProLicense && !shouldBeInPro
  }
)

export const isInTrialModeWithExpiredTrialSelector = createSelector(
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  (trialExpired, hasLicense, hasCurrentProLicense) => {
    return trialExpired && !hasLicense && !hasCurrentProLicense
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

export const isCloudFileSelector = createSelector(
  projectSelector,
  isOnWebSelector,
  (project, isOnWeb) => {
    return isOnWeb || (project && project.fileURL && urlPointsToPlottrCloud(project.fileURL))
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
        (!isInOfflineMode && !!hasActiveProSubscription !== !!selectedFileIsACloudFile))
    )
  }
)

export const canSaveSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  (fileURL, isResuming, isOffline, offlineModeEnabled, hasAllKeys, isCloudFile) => {
    return (
      !!fileURL &&
      !isResuming &&
      (!isCloudFile || !(isCloudFile && isOffline && !offlineModeEnabled)) &&
      hasAllKeys
    )
  }
)

export const shouldSaveOfflineFileSelector = createSelector(
  canSaveSelector,
  offlineModeEnabledSelector,
  isCloudFileSelector,
  (canSave, offlineModeEnabled, isCloudFile) => {
    return isCloudFile && canSave && offlineModeEnabled
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

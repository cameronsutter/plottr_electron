import { createSelector } from 'reselect'

export const exportSettingsSelector = (state) => state.settings.exportSettings
export const userSettingsSelector = (state) => state.settings.userSettings
export const appSettingsSelector = (state) => state.settings.appSettings
export const appUserSettingsSelector = createSelector(appSettingsSelector, ({ user }) => user || {})
export const previouslyLoggedIntoProSelector = createSelector(
  appSettingsSelector,
  (appSettings) => {
    return appSettings && appSettings && appSettings.user && appSettings.user.frbId
  }
)
export const showDashboardOnBootSelector = createSelector(
  appUserSettingsSelector,
  ({ openDashboardFirst }) => openDashboardFirst
)
export const isDarkModeSelector = createSelector(
  appUserSettingsSelector,
  ({ dark }) => dark === 'dark'
)
export const offlineModeEnabledSelector = createSelector(
  appUserSettingsSelector,
  ({ enableOfflineMode }) => enableOfflineMode
)
export const actStructureEnabled = createSelector(
  appUserSettingsSelector,
  ({ beatHierarchy }) => beatHierarchy
)
export const localBackupsEnabledSelector = createSelector(
  appUserSettingsSelector,
  ({ localBackups }) => localBackups
)
export const useSpellcheckSelector = createSelector(
  appUserSettingsSelector,
  ({ useSpellcheck }) => useSpellcheck
)
export const trialModeSelector = createSelector(appSettingsSelector, ({ trialMode }) => trialMode)
export const canGetUpdatesSelector = createSelector(
  appSettingsSelector,
  ({ canGetUpdates }) => canGetUpdates
)

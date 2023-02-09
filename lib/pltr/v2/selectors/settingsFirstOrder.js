// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

const settingsSelector = (state) => {
  return state.settings || {}
}
export const exportSettingsSelector = createSelector(
  settingsSelector,
  ({ exportSettings }) => exportSettings
)
export const userSettingsSelector = createSelector(
  settingsSelector,
  ({ userSettings }) => userSettings
)
export const appSettingsSelector = createSelector(settingsSelector, (settings) => {
  return settings.appSettings
})
export const appUserSettingsSelector = createSelector(appSettingsSelector, ({ user }) => user || {})
export const previouslyLoggedIntoProSelector = createSelector(
  appSettingsSelector,
  (appSettings) => {
    return appSettings && appSettings && appSettings.user && appSettings.user.frbId
  }
)
export const backupEnabledSelector = createSelector(appSettingsSelector, ({ backup }) => {
  return backup
})
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

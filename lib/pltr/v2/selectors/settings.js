import { createSelector } from 'reselect'

export const exportSettingsSelector = (state) => state.settings.exportSettings
export const userSettingsSelector = (state) => state.settings.userSettings
export const appSettingsSelector = (state) => state.settings.appSettings
export const previouslyLoggedIntoProSelector = createSelector(
  appSettingsSelector,
  (appSettings) => {
    return appSettings && appSettings && appSettings.user && appSettings.user.frbId
  }
)

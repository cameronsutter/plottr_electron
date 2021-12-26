import { SET_APP_SETTINGS, SET_EXPORT_SETTINGS, SET_USER_SETTINGS } from '../constants/ActionTypes'

export const setExportSettings = (exportSettings) => ({
  type: SET_EXPORT_SETTINGS,
  exportSettings,
})

export const setUserSettings = (userSettings) => ({
  type: SET_USER_SETTINGS,
  userSettings,
})

export const setAppSettings = (appSettings) => ({
  type: SET_APP_SETTINGS,
  appSettings,
})

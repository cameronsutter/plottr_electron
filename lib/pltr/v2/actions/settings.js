import {
  SET_APP_SETTINGS,
  SET_DARK_MODE,
  SET_EXPORT_SETTINGS,
  SET_USER_SETTINGS,
} from '../constants/ActionTypes'

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

// WARNING: only use this action if we were told by some special
// source (in the case of Desktop, the main process).  If you want to
// change the dark mode setting, it's best to change the settings
// store and have the listener update the value instead.
export const setDarkMode = (value) => ({
  type: SET_DARK_MODE,
  value,
})

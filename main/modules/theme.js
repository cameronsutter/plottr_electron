import { nativeTheme } from 'electron'
import SETTINGS from './settings'

function setDarkMode(newValue) {
  switch (newValue) {
    case 'dark':
      SETTINGS.user.dark = 'dark'
      removeThemeListener()
      break
    case 'light':
      SETTINGS.user.dark = 'light'
      removeThemeListener()
      break
    case 'system':
    default:
      if (nativeTheme.shouldUseDarkColors) {
        SETTINGS.user.dark = 'dark'
      }
      setThemeListener()
      break
  }
}

function setThemeListener() {
  nativeTheme.on('updated', () => {
    SETTINGS.user.dark = 'dark'
  })
}

function removeThemeListener() {
  nativeTheme.removeAllListeners('updated')
}

export { setDarkMode, setThemeListener, removeThemeListener }

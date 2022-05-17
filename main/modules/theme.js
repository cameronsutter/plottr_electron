import { nativeTheme } from 'electron'

import { broadcastToAllWindows } from './broadcast'
import SETTINGS from './settings'

function setDarkMode(newValue) {
  const source = SETTINGS.store.user.themeSource || (newValue !== 'system' && 'manual') || newValue
  switch (source) {
    case 'manual': {
      SETTINGS.set('user.dark', newValue)
      SETTINGS.set('user.themeSource', 'manual')
      removeThemeListener()
      break
    }
    case 'system':
    default: {
      SETTINGS.set('user.themeSource', 'system')
      if (nativeTheme.shouldUseDarkColors) {
        SETTINGS.set('user.dark', 'dark')
        broadcastToAllWindows('reload-dark-mode', 'dark')
      } else {
        SETTINGS.set('user.dark', 'light')
        broadcastToAllWindows('reload-dark-mode', 'light')
      }
      setThemeListener()
      break
    }
  }
}

function setThemeListener() {
  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      SETTINGS.set('user.dark', 'dark')
      broadcastToAllWindows('reload-dark-mode', 'dark')
    } else {
      SETTINGS.set('user.dark', 'light')
      broadcastToAllWindows('reload-dark-mode', 'light')
    }
  })
}

function removeThemeListener() {
  nativeTheme.removeAllListeners('updated')
}

export { setDarkMode, setThemeListener, removeThemeListener }

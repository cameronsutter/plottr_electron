import log from 'electron-log'
import { nativeTheme } from 'electron'

import { broadcastToAllWindows } from './broadcast'
import currentSettings, { saveAppSetting } from './settings'

function setDarkMode(newValue) {
  return currentSettings()
    .then((settings) => {
      const newValueOrDefault = newValue || settings.user.dark
      const source = (newValue !== 'system' && 'manual') || settings.user.themeSource || newValue
      switch (source) {
        case 'manual': {
          saveAppSetting('user.dark', newValueOrDefault)
            .then(() => {
              removeThemeListener()
              return saveAppSetting('user.themeSource', 'manual')
            })
            .catch((error) => {
              log.error('Error updating the themeSource to manual', error)
              return Promise.reject(error)
            })
          break
        }
        case 'system':
        default: {
          saveAppSetting('user.themeSource', 'system')
            .then(() => {
              if (nativeTheme.shouldUseDarkColors) {
                saveAppSetting('user.dark', 'dark')
                  .then(() => {
                    broadcastToAllWindows('reload-dark-mode', 'dark')
                  })
                  .catch((error) => {
                    log.error('Error saving the dark setting to light', error)
                    return Promise.reject(error)
                  })
              } else {
                saveAppSetting('user.dark', 'light')
                  .then(() => {
                    broadcastToAllWindows('reload-dark-mode', 'light')
                  })
                  .catch((error) => {
                    log.error('Error saving the dark setting to light', error)
                    return Promise.reject(error)
                  })
              }
              setThemeListener()
            })
            .catch((error) => {
              log.error('Error setting the theme source to system', error)
              return Promise.reject(error)
            })
          break
        }
      }
    })
    .catch((error) => {
      log.error('Error while getting settings to change darkMode', error)
      return Promise.reject(error)
    })
}

function setThemeListener() {
  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      saveAppSetting('user.dark', 'dark')
        .then(() => {
          broadcastToAllWindows('reload-dark-mode', 'dark')
        })
        .catch((error) => {
          log.error('Error changing the app settings to dark on native theme changed', error)
        })
    } else {
      saveAppSetting('user.dark', 'light')
        .then(() => {
          broadcastToAllWindows('reload-dark-mode', 'light')
        })
        .catch((error) => {
          log.error('Error changing the app settings to light on native theme changed', error)
        })
    }
  })
}

function removeThemeListener() {
  nativeTheme.removeAllListeners('updated')
}

export { setDarkMode, setThemeListener, removeThemeListener }

import electron from 'electron'
import log from 'electron-log'
import { is } from 'electron-util'
import { t, localeNames, setupI18n } from 'plottr_locales'
import currentSettings, { saveAppSetting } from '../settings'

import { reloadAllWindows } from '../windows'

const reloadMenuForLanguageChangeSuccessHandler = () => {
  log.info('Menu reloaded after language change')
  reloadAllWindows()
}

const reloadMenuForLanguageChangeFailureHandler = (error) => {
  log.error('Failed to reload menu for language change', error)
  return Promise.reject(error)
}

const setLocale = (locale) => {
  return saveAppSetting('locale', locale)
    .then(() => {
      return currentSettings().then((settings) => {
        setupI18n(settings, { locale: electron.app.getLocale() })
      })
    })
    .catch((error) => {
      log.error('Failed to change locale settings', error)
      return Promise.reject(error)
    })
}

function buildPlottrMenu(loadMenu, safelyExit) {
  return currentSettings()
    .then((settings) => {
      const isPro = settings.user?.frbId
      const notEnglish = { ...localeNames }
      delete notEnglish.en
      const englishFirst = [
        {
          label: 'English',
          click: () => {
            setLocale('en').then(() => {
              return loadMenu(safelyExit)
                .then(reloadMenuForLanguageChangeSuccessHandler)
                .catch(reloadMenuForLanguageChangeFailureHandler)
            })
          },
        },
        {
          type: 'separator',
        },
        ...Object.entries(notEnglish).map(([locale, name]) => ({
          label: name,
          click: () => {
            setLocale(locale).then(() => {
              return loadMenu(safelyExit)
                .then(reloadMenuForLanguageChangeSuccessHandler)
                .catch(reloadMenuForLanguageChangeFailureHandler)
            })
          },
        })),
      ]

      const submenu = [
        {
          label: t('Language'),
          submenu: englishFirst,
        },
      ]

      if (is.macos) {
        submenu.push(
          {
            label: t('Hide Plottr'),
            accelerator: 'Command+H',
            role: 'hide',
          },
          {
            label: t('Hide Others'),
            accelerator: 'Command+Alt+H',
            role: 'hideothers',
          },
          {
            label: t('Show All'),
            role: 'unhide',
          },
          {
            type: 'separator',
          },
          {
            label: t('Quit'),
            accelerator: 'Cmd+Q',
            click: () => {
              safelyExit.quitWhenDone()
            },
          }
        )
      } else {
        submenu.push({
          label: t('Close'),
          accelerator: 'Alt+F4',
          click: () => {
            safelyExit.quitWhenDone()
          },
        })
      }
      return {
        label: isPro ? 'Plottr Pro' : 'Plottr',
        submenu: submenu,
      }
    })
    .catch((error) => {
      log.error('Could not read current settings when trying to build plottr menu', error)
      return Promise.rejec(error)
    })
}

export { buildPlottrMenu }

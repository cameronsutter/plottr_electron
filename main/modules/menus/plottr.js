import electron from 'electron'
import log from 'electron-log'
const { app } = electron
import { is } from 'electron-util'
import { t, localeNames, setupI18n } from 'plottr_locales'
import SETTINGS from '../settings'
import { reloadAllWindows } from '../windows'

const reloadMenuForLanguageChangeSuccessHandler = () => {
  log.info('Menu reloaded after language change')
  reloadAllWindows()
}

const reloadMenuForLanguageChangeFailureHandler = (error) => {
  log.error('Failed to reload menu for language change', error)
  return Promise.reject(error)
}

function buildPlottrMenu(loadMenu) {
  const isPro = SETTINGS.get('user.frbId')
  const notEnglish = { ...localeNames }
  delete notEnglish.en

  const englishFirst = [
    {
      label: 'English',
      click: () => {
        SETTINGS.set('locale', 'en')
        setupI18n(SETTINGS, { electron })
        loadMenu()
          .then(reloadMenuForLanguageChangeSuccessHandler)
          .catch(reloadMenuForLanguageChangeFailureHandler)
      },
    },
    {
      type: 'separator',
    },
    ...Object.entries(notEnglish).map(([locale, name]) => ({
      label: name,
      click: () => {
        SETTINGS.set('locale', locale)
        setupI18n(SETTINGS, { electron })
        loadMenu()
          .then(reloadMenuForLanguageChangeSuccessHandler)
          .catch(reloadMenuForLanguageChangeFailureHandler)
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
        click: function () {
          app.quit()
        },
      }
    )
  } else {
    submenu.push({
      label: t('Close'),
      accelerator: 'Alt+F4',
      click: function () {
        app.quit()
      },
    })
  }
  return {
    label: isPro ? 'Plottr Pro' : 'Plottr',
    submenu: submenu,
  }
}

export { buildPlottrMenu }

import electron from 'electron'
const { app } = electron
import { is } from 'electron-util'
import { t, localeNames, setupI18n } from 'plottr_locales'
import SETTINGS from '../settings'
import { reloadAllWindows } from '../windows'

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
        reloadAllWindows()
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
        reloadAllWindows()
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

const i18n = require('plottr_locales').t
const electron = require('electron')
const { app } = electron
const { is } = require('electron-util')
// const { NODE_ENV } = require('../constants')
const { localeNames, setupI18n } = require('plottr_locales')
const SETTINGS = require('../settings')
const { reloadAllWindows } = require('../windows')

function buildPlottrMenu() {
  const isPro = SETTINGS.get('user.frbId')
  const notEnglish = { ...localeNames }
  delete notEnglish.en

  const englishFirst = [
    {
      label: 'English',
      click: () => {
        SETTINGS.set('locale', 'en')
        setupI18n(SETTINGS, { electron })
        require('./').loadMenu()
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
        require('./').loadMenu()
        reloadAllWindows()
      },
    })),
  ]

  const submenu = [
    {
      label: i18n('Language'),
      submenu: englishFirst,
    },
  ]

  if (is.macos) {
    submenu.push(
      {
        label: i18n('Hide Plottr'),
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: i18n('Hide Others'),
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      },
      {
        label: i18n('Show All'),
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        label: i18n('Quit'),
        accelerator: 'Cmd+Q',
        click: function () {
          app.quit()
        },
      }
    )
  } else {
    submenu.push({
      label: i18n('Close'),
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

module.exports = { buildPlottrMenu }

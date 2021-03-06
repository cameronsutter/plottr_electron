const i18n = require('plottr_locales').t
const { reloadWindow } = require('../windows')
const { takeScreenshot } = require('../helpers')

function buildViewMenu() {
  const submenu = [
    {
      label: i18n('Reload'),
      accelerator: 'CmdOrCtrl+R',
      click: reloadWindow,
    },
    {
      label: i18n('Take Screenshot') + '...',
      accelerator: 'CmdOrCtrl+P',
      click: takeScreenshot,
    },
  ]

  return {
    label: i18n('View'),
    submenu: submenu,
  }
}

module.exports = { buildViewMenu }

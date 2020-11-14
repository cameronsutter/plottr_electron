const i18n = require('format-message');
const { reloadWindow } = require('../windows');
const {
  getDarkMode,
  toggleDarkMode,
} = require('../theme');
const { takeScreenshot } = require('../helpers');
const { NODE_ENV } = require('../constants');
const { openVerifyWindow } = require('../windows/verify');
const { openExpiredWindow } = require('../windows/expired');

function buildViewMenu () {
  const submenu = [{
    label: i18n('Reload'),
    accelerator: 'CmdOrCtrl+R',
    click: reloadWindow
  }, {
      label: i18n('Dark Mode'),
      accelerator: 'CmdOrCtrl+D',
      checked: getDarkMode(),
      type: 'checkbox',
      click: () => toggleDarkMode()
  }, {
    label: i18n('Take Screenshot') + '...',
    accelerator: 'CmdOrCtrl+P',
    click: takeScreenshot
  }, {
    type: 'separator',
    visible: NODE_ENV === 'dev',
  }, {
    label: 'View Verify Window',
    click: openVerifyWindow,
    visible: NODE_ENV === 'dev',
  }, {
    label: 'View Expired Window',
    click: openExpiredWindow,
    visible: NODE_ENV === 'dev',
  }]

  return {
    label: i18n('View'),
    submenu: submenu
  }
}

module.exports = { buildViewMenu };

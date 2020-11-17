const i18n = require('format-message');
const {
  dialog,
  app,
} = require('electron');
const { machineIdSync } = require('node-machine-id');
const { openProcessManager } = require('electron-process-manager');
const { is } = require('electron-util');
const SETTINGS = require('../settings');
const { checkUpdatesIfAllowed } = require('../utils');
const { getLicenseInfo } = require('../license_checker');
const {
  TRIAL_MODE,
  NODE_ENV,
} = require('../constants');
const {
  reloadWindow,
} = require('../windows');
const { openAboutWindow } = require('../windows/about');
const { openBuyWindow } = require('../windows/buy');
const { openVerifyWindow } = require('../windows/verify');
const { getDaysLeftInTrial } = require('../trial_manager');

const USER_INFO = getLicenseInfo();

function buildPlottrMenu () {
  const submenu = [{
    label: i18n('About Plottr'),
    click: openAboutWindow,
  }, {
    label: i18n('Check for Updates'),
    click: checkUpdatesIfAllowed,
    visible: SETTINGS.get('canGetUpdates'),
  }]
  if (TRIAL_MODE) {
    submenu.push(
      {
        type: 'separator',
      },
      {
        label: i18n('View the Tour'),
        click: () => {
          SETTINGS.set('showTheTour', true)
          reloadWindow()
        }
      },
      {
        label: i18n('{days} days remaining', {days: getDaysLeftInTrial()}),
        enabled: false,
      },
      {
        label: i18n('Buy Full Version') + '...',
        click: openBuyWindow,
      },
      {
        label: i18n('Activate License') + '...',
        click: openVerifyWindow,
      },
      {
        type: 'separator',
      }
    )
  }
  submenu.push(
    {
      label: i18n('View License Key'),
      visible: !TRIAL_MODE,
      click: () => {
        const licenseKey = USER_INFO.licenseKey
        if (licenseKey) {
          const title = i18n('License Key')
          const text = i18n('Here is your license key')
          dialog.showMessageBoxSync({type: 'info', title: title, message: text, detail: licenseKey})
        } else {
          dialog.showErrorBox(i18n('Error'), i18n('Could not display license key. Try again'))
        }
      }
    },
    {
      label: i18n('View Device ID'),
      visible: !TRIAL_MODE,
      click: () => {
        const id = machineIdSync(true)
        const title = i18n('Device ID')
        const text = i18n('This is your Device ID')
        dialog.showMessageBoxSync({type: 'info', title: title, message: text, detail: id})
      }
    },
    {
      label: 'View Process Manager',
      visible: NODE_ENV === 'dev',
      click: () => openProcessManager()
    },
  )

  if (is.macos) {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: i18n('Hide Plottr'),
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: i18n('Hide Others'),
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: i18n('Show All'),
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: i18n('Quit'),
        accelerator: 'Cmd+Q',
        click: function () {
          app.quit()
        }
      }
    )
  } else {
    submenu.push({
      label: i18n('Close'),
      accelerator: 'Alt+F4',
      click: function () {
        app.quit()
      }
    })
  }
  return {
    label: 'Plottr',
    submenu: submenu
  }
}

module.exports = { buildPlottrMenu };

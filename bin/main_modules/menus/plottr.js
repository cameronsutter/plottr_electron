const i18n = require('format-message')
const { app } = require('electron')
const { openProcessManager } = require('electron-process-manager')
const { is } = require('electron-util')
const { NODE_ENV } = require('../constants')

function buildPlottrMenu () {
  const submenu = []

  if (NODE_ENV === 'dev') {
    submenu.push(
      {
        label: 'View Process Manager',
        visible: NODE_ENV === 'dev',
        click: () => openProcessManager()
      }, {
        type: 'separator'
      },
    )
  }

  if (is.macos) {
    submenu.push(
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

module.exports = { buildPlottrMenu }

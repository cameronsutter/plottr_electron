const path = require('path')
const { t } = require('plottr_locales')
const log = require('electron-log')
const { app, shell } = require('electron')
const { is } = require('electron-util')
const { getWindowById, numberOfWindows } = require('../windows')
const { NODE_ENV } = require('../constants')
const { newFileOptions } = require('../new_file_options')
const { getLicenseInfo } = require('../license_info')
const { getTriaInfo } = require('../trial_info')

const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')
let showInMessage = t('Show in File Explorer')
if (is.macos) {
  showInMessage = t('Show in Finder')
}

function buildFileMenu(filePath) {
  const isCloudFile = filePath && filePath.startsWith('plottr://')
  const isTemp = filePath && filePath.includes(TEMP_FILES_PATH)
  const licenseStore = getLicenseInfo()
  const trialStore = getTriaInfo()
  let submenu = [
    {
      label: t('Save'),
      accelerator: 'CmdOrCtrl+S',
      click: function (event, focusedWindow) {
        if (isTemp) {
          focusedWindow.webContents.send('move-from-temp')
        } else {
          focusedWindow.webContents.send('save')
        }
      },
    },
    {
      label: t('Save as') + '...',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: function (event, focusedWindow) {
        if (isCloudFile) {
          focusedWindow.webContents.send('rename-file', filePath.replace(/^plottr:\/\//, ''))
        } else {
          focusedWindow.webContents.send('save-as')
        }
      },
    },
    {
      label: showInMessage,
      visible: !isTemp,
      click: function () {
        shell.showItemInFolder(filePath)
      },
    },
    {
      label: t('Close'),
      accelerator: 'CmdOrCtrl+W',
      click: function (event, focusedWindow) {
        log.info('sending wants-to-close')
        focusedWindow.webContents.send('wants-to-close')
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('Export'),
      enabled:
        (trialStore && !trialStore.expired && trialStore.startsAt) ||
        (licenseStore && Object.keys(licenseStore).length > 0),
      submenu: [
        {
          label: t('MS Word'),
          click: (event, focusedWindow) => {
            const options = { type: 'word' }
            focusedWindow.webContents.send('export-file-from-menu', options)
          },
        },
        {
          label: t('Scrivener'),
          click: (event, focusedWindow) => {
            const options = { type: 'scrivener' }
            focusedWindow.webContents.send('export-file-from-menu', options)
          },
        },
        {
          label: t('Advanced...'),
          click: (event, focusedWindow) => {
            focusedWindow.webContents.send('advanced-export-file-from-menu')
          },
        },
      ],
    },
    {
      label: t('Reload from File'),
      visible: NODE_ENV === 'development',
      click: (event, focusedWindow) => {
        const winObj = getWindowById(focusedWindow.id)
        if (winObj) {
          focusedWindow.webContents.send(
            'reload-from-file',
            winObj.filePath,
            newFileOptions(),
            numberOfWindows()
          )
        }
      },
    },
  ]
  return {
    label: t('File'),
    submenu: submenu,
  }
}

module.exports = { buildFileMenu }

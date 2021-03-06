const path = require('path')
const i18n = require('plottr_locales').t
const { app, dialog, shell } = require('electron')
const { is } = require('electron-util')
const { getWindowById, numberOfWindows } = require('../windows')
const { NODE_ENV } = require('../constants')
const { openDashboard } = require('../windows/dashboard')
const { newFileOptions } = require('../new_file_options')

const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')
let showInMessage = i18n('Show in File Explorer')
if (is.macos) {
  showInMessage = i18n('Show in Finder')
}

function buildFileMenu(filePath) {
  const isTemp = filePath && filePath.includes(TEMP_FILES_PATH)
  let submenu = [
    {
      label: i18n('Open Dashboard'),
      click: function () {
        openDashboard()
      },
    },
    {
      type: 'separator',
    },
    {
      label: i18n('Save'),
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
      label: i18n('Save as') + '...',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: function (event, focusedWindow) {
        focusedWindow.webContents.send('save-as')
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
      label: i18n('Close'),
      accelerator: 'CmdOrCtrl+W',
      click: function (event, focusedWindow) {
        focusedWindow.webContents.send('wants-to-close')
      },
    },
    {
      type: 'separator',
    },
    {
      label: i18n('Export'),
      submenu: [
        {
          label: i18n('MS Word'),
          click: (event, focusedWindow) => {
            const winObj = getWindowById(focusedWindow.id)
            if (winObj) {
              const defaultPath = path.basename(winObj.filePath).replace('.pltr', '')
              const filters = [{ name: i18n('Word Document'), extensions: ['docx'] }]
              const fileName = dialog.showSaveDialogSync(focusedWindow, {
                filters,
                title: i18n('Where would you like to save the export?'),
                defaultPath,
              })
              if (fileName) {
                const options = { fileName, type: 'word' }
                focusedWindow.webContents.send('export-file', options)
              }
            }
          },
        },
        {
          label: i18n('Scrivener'),
          click: (event, focusedWindow) => {
            const winObj = getWindowById(focusedWindow.id)
            if (winObj) {
              const defaultPath = path.basename(winObj.filePath).replace('.pltr', '')
              const filters = [{ name: i18n('Scrivener Project'), extensions: ['scriv'] }]
              const fileName = dialog.showSaveDialogSync(focusedWindow, {
                filters,
                title: i18n('Where would you like to save the export?'),
                defaultPath,
              })
              if (fileName) {
                const options = { fileName, type: 'scrivener' }
                focusedWindow.webContents.send('export-file', options)
              }
            }
          },
        },
      ],
    },
    {
      label: i18n('Reload from File'),
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
    label: i18n('File'),
    submenu: submenu,
  }
}

module.exports = { buildFileMenu }

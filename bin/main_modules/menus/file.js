const path = require('path')
const fs = require('fs')
const i18n = require('format-message')
// const { cloneDeep } = require('lodash')
const { BrowserWindow, dialog } = require('electron')
const { is } = require('electron-util')
const log = require('electron-log')
const { rollbar } = require('../rollbar')
const { getWindowById } = require('../windows')
// const { openDashboardWindow } = require('../windows/dashboard')
// const {
//   askToOpenFile,
//   gracefullyNotSave,
//   askToSave,
//   askToCreateFile,
// } = require('../utils')
// const FileManager = require('../file_manager')
// const Exporter = require('../exporter')
// const { getDarkMode } = require('../theme')
const { NODE_ENV } = require('../constants')
const { openDashboard } = require('../windows/dashboard')

// TODO: refactor dashboard so it can be opened from here

function buildFileMenu () {
  let submenu = [{
    label: i18n('Open Dashboard'),
    click: function () {
      openDashboard()
    }
  }, {
    type: 'separator',
  }, {
    label: i18n('Save'),
    accelerator: 'CmdOrCtrl+S',
    click: function (event, focusedWindow) {
      focusedWindow.webContents.send('save')
    }
  }, {
    label: i18n('Save as') + '...',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: function () {
      // let win = BrowserWindow.getFocusedWindow()
      // let winObj = getWindowById(win.id);
      // if (winObj) {
      //   const defaultPath = path.basename(winObj.state.file.fileName).replace('.pltr', '')
      //   const filters = [{name: 'Plottr file', extensions: ['pltr']}]
      //   const fileName = dialog.showSaveDialogSync(win, {filters, title: i18n('Where would you like to save this copy?'), defaultPath})
      //   if (fileName) {
      //     let fullName = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      //     let newState = cloneDeep(winObj.state)
      //     FileManager.save(fullName, newState, (err) => {
      //       if (err) {
      //         log.warn(err)
      //         rollbar.warn(err, {fileName: fullName})
      //         gracefullyNotSave()
      //       } else {
      //         openWindow(fullName, newState)
      //       }
      //     })
      //   }
      // }
    }
  }, {
    label: i18n('Close'),
    accelerator: 'CmdOrCtrl+W',
    click: function (event, focusedWindow) {
      focusedWindow.webContents.send('wants-to-close')
    }
  }, {
    type: 'separator'
  }, {
    label: i18n('Export'),
    submenu: [
      {
        label: i18n('MS Word'),
        click: (event, focusedWindow) => {
          const winObj = getWindowById(focusedWindow.id)
          if (winObj) {
            const defaultPath = path.basename(winObj.filePath).replace('.pltr', '')
            const filters = [{name: i18n('Word Document'), extensions: ['docx']}]
            const fileName = dialog.showSaveDialogSync(focusedWindow, {filters, title: i18n('Where would you like to save the export?'), defaultPath})
            if (fileName) {
              const options = { fileName, type: 'word' }
              focusedWindow.webContents.send('export-file', options)
            }
          }
        }
      },
      {
        label: i18n('Scrivener'),
        click: (event, focusedWindow) => {
          const winObj = getWindowById(focusedWindow.id)
          if (winObj) {
            const defaultPath = path.basename(winObj.filePath).replace('.pltr', '')
            const filters = [{name: i18n('Scrivener Project'), extensions: ['scriv']}]
            const fileName = dialog.showSaveDialogSync(focusedWindow, {filters, title: i18n('Where would you like to save the export?'), defaultPath})
            if (fileName) {
              const options = { fileName, type: 'scrivener' }
              focusedWindow.webContents.send('export-file', options)
            }
          }
        }
      }
    ]
  }, {
    label: i18n('Reload from File'),
    visible: NODE_ENV === 'dev',
    click: (event, focusedWindow) => {
      // const winObj = getWindowById(focusedWindow.id)
      // if (winObj) {
      //   try {
      //     const json = JSON.parse(fs.readFileSync(winObj.fileName, 'utf-8'))
      //     winObj.state = json
      //     winObj.lastSave = json
      //     focusedWindow.webContents.send('state-fetched', json, winObj.fileName, true, getDarkMode(), windows.length)
      //   } catch (error) {
      //     log.info(error)
      //   }
      // }
    }
  }]
  return {
    label: i18n('File'),
    submenu: submenu
  }
}

module.exports = { buildFileMenu };

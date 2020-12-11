const path = require('path')
const { app, ipcMain } = require('electron')
const log = require('electron-log')
const { makeBrowserWindow } = require('../utils')
const { filePrefix } = require('../helpers')
const { updateOpenFiles } = require('./dashboard')
const { rollbar } = require('../rollbar')
// const { NODE_ENV } = require('../constants')
const { getWindowById, addNewWindow, dereferenceWindow, focusIfOpen } = require('.')


ipcMain.on('pls-open-window', (event, filePath, jsonData) => {
  openProjectWindow(filePath, jsonData, null)
})

function openProjectWindow (filePath) {
  if (focusIfOpen(filePath)) return

  const newWindow = makeBrowserWindow(filePath)

  const entryFile = path.join(filePrefix(__dirname), '../../app.html')
  newWindow.loadURL(entryFile)

  // newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) // depends on 'this' being the window
    if (win) {
      updateOpenFiles(win.filePath)
      dereferenceWindow(win)
    }
  })

  try {
    app.addRecentDocument(filePath)
    addNewWindow(newWindow, filePath)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {filePath: filePath})
    newWindow.destroy()
  }
}

module.exports = { openProjectWindow }

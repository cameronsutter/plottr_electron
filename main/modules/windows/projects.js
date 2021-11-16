const path = require('path')
const { app, ipcMain } = require('electron')
const log = require('electron-log')
const { makeBrowserWindow } = require('../utils')
const { filePrefix } = require('../helpers')
const { updateOpenFiles } = require('./files')
const { rollbar } = require('../rollbar')
const { getWindowById, addNewWindow, dereferenceWindow, focusIfOpen } = require('.')
const { addToKnown } = require('../known_files')

ipcMain.on('pls-open-window', (event, filePath, unknown) => {
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
})

function openProjectWindow(filePath) {
  if (focusIfOpen(filePath)) return
  const newWindow = makeBrowserWindow(filePath)

  const entryFile = filePrefix(path.join(__dirname, 'app.html'))
  newWindow.loadURL(entryFile)

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) || e.sender // depends on 'this' being the window
    if (win) {
      updateOpenFiles(win.filePath)
      dereferenceWindow(win)
      win.browserWindow.webContents.destroy()
    }
  })

  try {
    app.addRecentDocument(filePath)
    addNewWindow(newWindow, filePath)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, { filePath: filePath })
    newWindow.destroy()
  }
}

module.exports = { openProjectWindow }

const path = require('path')
const { app, ipcMain } = require('electron')
const log = require('electron-log')
const { makeBrowserWindow } = require('../utils')
const { filePrefix } = require('../helpers')
const { updateOpenFiles } = require('./dashboard')
const { rollbar } = require('../rollbar')
// const { NODE_ENV } = require('../constants')
const { getWindowById, addNewWindow, dereferenceWindow, focusIfOpen } = require('.')
const { addToKnown } = require('../known_files')
const { loadMenu } = require('../menus')

ipcMain.on('pls-open-window', (event, filePath, unknown) => {
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
})

function openProjectWindow(filePath) {
  if (focusIfOpen(filePath)) return

  const newWindow = makeBrowserWindow(filePath)

  const entryFile = filePrefix(path.resolve('.', 'bin', 'app.html'))
  log.info('entryFile', entryFile)
  newWindow.loadURL(entryFile)

  newWindow.on('closed', function () {
    // doing this here because we can't do the right thing: loadMenu on dashboard focus
    // see rants below about why not
    loadMenu()
  })

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) // depends on 'this' being the window
    if (win) {
      updateOpenFiles(win.filePath)
      dereferenceWindow(win)
    }
  })

  newWindow.on('focus', () => {
    // WHY does it work here, but not in utils (nor windows/dashboard)????
    // in those others, loadMenu is undefined after requiring it
    loadMenu()
  })

  newWindow.on('blur', () => {
    // WHY does it work here, but not in utils (nor windows/dashboard)????
    // in those others, loadMenu is undefined after requiring it
    loadMenu()
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

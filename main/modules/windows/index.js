const { BrowserWindow, ipcMain } = require('electron')
const { openBuyWindow } = require('./buy')
const { newFileOptions } = require('../new_file_options')

ipcMain.on('open-buy-window', (event) => {
  openBuyWindow()
})

let windows = []

function hasWindows() {
  return !!windows.length
}

function allWindows() {
  return windows
}

function addNewWindow(browserWindow, filePath) {
  windows.push({
    id: browserWindow.id,
    browserWindow: browserWindow,
    filePath: filePath,
  })
}

function getWindowById(id) {
  return windows.find((window) => window.id == id)
}

function focusFirstWindow() {
  if (!windows.length) return

  windows[0].browserWindow.focus()
}

function numberOfWindows() {
  return windows.length
}

function focusIfOpen(filePath) {
  const win = windows.find((w) => w.filePath == filePath)
  if (win) {
    win.browserWindow.focus()
    win.browserWindow.webContents.send('close-dashboard')
    // If it's this window and we're trying to open a new file, then
    // we need to refresh the contents.
    win.browserWindow.webContents.send(
      'reload-from-file',
      filePath,
      newFileOptions(),
      numberOfWindows()
    )
    return true
  } else {
    return false
  }
}

function reloadWindow() {
  let win = BrowserWindow.getFocusedWindow()
  win.webContents.send('reload')
}

function reloadAllWindows() {
  windows.forEach((w) => w.browserWindow.webContents.send('reload'))
}

function dereferenceWindow(winObj) {
  const index = windows.findIndex((win) => win.id === winObj.id)
  windows.splice(index, 1)
}

function closeWindow(id) {
  let win = getWindowById(id)
  if (win) win.browserWindow.send('close')
}

module.exports = {
  addNewWindow,
  allWindows,
  reloadWindow,
  hasWindows,
  focusFirstWindow,
  dereferenceWindow,
  closeWindow,
  getWindowById,
  numberOfWindows,
  focusIfOpen,
  reloadAllWindows,
}

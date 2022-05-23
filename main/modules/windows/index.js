import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { openBuyWindow } from './buy'
import { newFileOptions } from '../new_file_options'
import { offlineFilePath } from '../offlineFilePath'

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

function setFilePathForWindowWithFilePath(oldFilePath, newFilePath) {
  const window = allWindows().find((window) => {
    return window.filePath === oldFilePath
  })

  if (window) {
    window.oldFilePath = window.filePath
    window.filePath = newFilePath
    log.info('Renaming window with path: ', oldFilePath, ' to: ', newFilePath)
  } else {
    log.warn(
      'Attempting to rename window with path: ',
      oldFilePath,
      ' to: ',
      newFilePath,
      'but could not find the window'
    )
  }
}

function setFilePathForWindowWithId(id, filePath) {
  const window = allWindows().find((window) => {
    return window.id === id
  })

  if (window) {
    window.oldFilePath = window.filePath
    window.filePath = filePath
    log.info(`Setting file path for window with id: ${id} to: ${filePath}`)
  } else {
    log.error(`Could not find window with id: ${id} to set to path: ${filePath}`)
  }
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

function editWindowPath(oldFilePath, newFilePath) {
  const win = windows.find((w) => w.filePath == oldFilePath)
  if (win) {
    win.filePath = newFilePath
  }
}

function focusIfOpen(filePath) {
  if (!filePath) return false

  const offlinePath = offlineFilePath(filePath)
  const win = windows.find((w) => w.filePath == filePath || w.filePath === offlinePath)
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
  win.webContents.reload()
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

export {
  setFilePathForWindowWithFilePath,
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
  editWindowPath,
  reloadAllWindows,
  setFilePathForWindowWithId,
}

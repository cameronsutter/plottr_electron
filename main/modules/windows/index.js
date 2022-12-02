import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { openBuyWindow } from './buy'
import { offlineFileURL } from '../offlineFilePath'
import { featureFlags } from '../feature_flags'

ipcMain.on('open-buy-window', (event, replyChannel) => {
  try {
    openBuyWindow()
    event.sender.send(replyChannel, 'done')
  } catch (error) {
    log.error('Error opening buy window', error)
    event.sender.send(replyChannel, { error: error.message })
  }
})

let windows = []

function hasWindows() {
  return !!windows.length
}

function allWindows() {
  return windows
}

function setFilePathForWindowWithId(id, fileURL) {
  const window = allWindows().find((window) => {
    return window.id === id
  })

  if (window) {
    window.oldFileURL = window.fileURL
    window.fileURL = fileURL
    log.info(`Setting file path for window with id: ${id} to: ${fileURL}`)
  } else {
    log.error(`Could not find window with id: ${id} to set to path: ${fileURL}`)
  }
}

function addNewWindow(browserWindow, fileURL) {
  windows.push({
    id: browserWindow.id,
    browserWindow: browserWindow,
    fileURL: fileURL,
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

function editWindowPath(oldFileURL, newFileURL) {
  const win = windows.find((w) => w.fileURL == oldFileURL)
  if (win) {
    win.fileURL = newFileURL
  }
}

function focusIfOpen(fileURL) {
  if (!fileURL) return false

  const offlineURL = offlineFileURL(fileURL)
  const win = windows.find(
    (w) => w.fileURL == fileURL || (offlineURL !== null && w.fileURL === offlineURL)
  )
  if (win) {
    win.browserWindow.focus()
    win.browserWindow.webContents.send('close-dashboard')
    // If it's this window and we're trying to open a new file, then
    // we need to refresh the contents.
    featureFlags().then((flags) => {
      win.browserWindow.webContents.send('reload-from-file', fileURL, flags, numberOfWindows())
    })
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

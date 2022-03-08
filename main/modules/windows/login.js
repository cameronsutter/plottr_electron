import path from 'path'
import log from 'electron-log'
import { BrowserWindow } from 'electron'

import { filePrefix } from '../helpers'

export function openLoginPopupWindow() {
  const config = {
    width: 700,
    height: 600,
    fullscreen: false,
    show: false,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true,
      webviewTag: true,
      contextIsolation: false,
    },
  }
  const newWindow = new BrowserWindow(config)

  newWindow.once('ready-to-show', () => {
    newWindow.show()
  })

  newWindow.webContents.on('did-finish-load', () => {
    if (!newWindow.isVisible()) newWindow.show()
  })

  newWindow.webContents.on('unresponsive', () => {
    log.warn('webContents became unresponsive')
    newWindow.webContents.reload()
  })
  newWindow.webContents.on('responsive', () => {
    log.info('webContents responsive again')
  })

  newWindow.on('unresponsive', () => {
    log.warn('window became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.on('responsive', () => {
    log.info('window responsive again')
  })

  const entryFile = filePrefix(path.join(__dirname, 'login-popup.html'))
  newWindow.loadURL(entryFile)
}

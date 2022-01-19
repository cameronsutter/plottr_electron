import { Menu, ipcMain, BrowserWindow } from 'electron'

import { buildPlottrMenu } from './plottr'
import { buildEditMenu } from './edit'
import { buildWindowMenu } from './window'
import { buildHelpMenu } from './help'
import { buildFileMenu } from './file'
import { buildViewMenu } from './view'
import { getWindowById } from '../windows'

ipcMain.on('pls-reload-menu', () => loadMenu())

function buildMenu() {
  const win = BrowserWindow.getFocusedWindow()
  let filePath = null
  if (win) {
    const winObj = getWindowById(win.id)
    if (winObj) {
      filePath = winObj.filePath
    }
  }
  return [
    buildPlottrMenu(buildMenu),
    buildFileMenu(filePath),
    buildEditMenu(),
    buildViewMenu(),
    buildWindowMenu(),
    buildHelpMenu(),
  ]
}

function loadMenu() {
  const template = buildMenu()
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export { loadMenu }

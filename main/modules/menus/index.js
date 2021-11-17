const { Menu, ipcMain, BrowserWindow } = require('electron')

const { buildPlottrMenu } = require('./plottr')
const { buildEditMenu } = require('./edit')
const { buildWindowMenu } = require('./window')
const { buildHelpMenu } = require('./help')
const { buildFileMenu } = require('./file')
const { buildViewMenu } = require('./view')
const { getWindowById } = require('../windows')

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
    buildPlottrMenu(),
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

module.exports = { loadMenu }

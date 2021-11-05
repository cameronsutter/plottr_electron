const { Menu, ipcMain, BrowserWindow } = require('electron')

const { buildPlottrMenu } = require('./plottr')
const { buildEditMenu } = require('./edit')
const { buildWindowMenu } = require('./window')
const { buildHelpMenu } = require('./help')
const { buildFileMenu } = require('./file')
const { buildViewMenu } = require('./view')
const { getWindowById } = require('../windows')

ipcMain.on('pls-reload-menu', () => {
  loadMenu()
})

function buildMenu() {
  let menus = [buildPlottrMenu()]

  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    const winObj = getWindowById(win.id)
    let filePath = null
    if (winObj) {
      filePath = winObj.filePath
    }
    menus.push(buildFileMenu(filePath))
  }
  return [...menus, buildEditMenu(), buildViewMenu(), buildWindowMenu(), buildHelpMenu()]
}

function loadMenu(makeItSimple) {
  const template = buildMenu(makeItSimple)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = { loadMenu }

const { Menu, ipcMain } = require('electron')
const i18n = require('format-message')
const { is } = require('electron-util')

const { buildPlottrMenu } = require('./plottr')
const { buildEditMenu } = require('./edit')
const { buildWindowMenu } = require('./window')
const { buildHelpMenu } = require('./help')
const { buildFileMenu } = require('./file')
const { buildViewMenu } = require('./view')
const { openDashboard } = require('../windows/dashboard')

ipcMain.on('pls-reload-menu', () => {
  console.log('loading menu!')
  loadMenu()
})

function buildMenu (makeItSimple) {
  if (makeItSimple) {
    return [
      buildPlottrMenu(),
      buildEditMenu(),
      buildWindowMenu(),
      buildHelpMenu()
    ]
  }

  return [
    buildPlottrMenu(),
    buildFileMenu(),
    buildEditMenu(),
    buildViewMenu(),
    buildWindowMenu(),
    buildHelpMenu()
  ]
}

function loadMenu (makeItSimple) {
  const template = buildMenu(makeItSimple)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (is.macos) {
    const dockMenu = Menu.buildFromTemplate([
      {label: i18n('Open Dashboard'), click: function () {
        openDashboard()
      }},
    ])
    app.dock.setMenu(dockMenu)
  }
}

module.exports = {
  buildMenu,
  loadMenu,
}

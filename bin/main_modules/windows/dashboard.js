const path = require('path')
const { BrowserWindow } = require('electron')
const { filePrefix } = require('../helpers')
const { preventsQuitting } = require('./')
const SETTINGS = require('../settings')

let dashboardWindow
const openDashboardWindow = preventsQuitting(() => {
  const dashboardFile = path.join(filePrefix(__dirname), '../../dashboard.html')
  dashboardWindow = new BrowserWindow({
    frame: false,
    height: 525,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })
  dashboardWindow.loadURL(dashboardFile)
  if (SETTINGS.get('forceDevTools')) {
    dashboardWindow.openDevTools()
  }
  dashboardWindow.once('ready-to-show', function() {
    this.show()
  })
  dashboardWindow.on('close', function () {
    dashboardWindow = null
  })
})

module.exports = { openDashboardWindow }

const path = require('path')
const { app, ipcMain } = require('electron')
const { is } = require('electron-util')
const { filePrefix } = require('../helpers')
const { windows } = require('./')
const { makeBrowserWindow } = require('../utils')

// mixpanel tracking
let launchSent = false

let dashboardWindow
ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
  reloadRecents()
})

function openDashboard () {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const dashboardFile = path.join(filePrefix(__dirname), '../../dashboard.html')
  dashboardWindow = makeBrowserWindow('dashboard')
  dashboardWindow.loadURL(dashboardFile)

  dashboardWindow.on('close', function () {
    dashboardWindow = null
    if (!windows.length && !is.macos) {
      app.quit()
    }
  })
  dashboardWindow.webContents.on('did-finish-load', () => {
    if (!launchSent) {
      dashboardWindow.webContents.send('send-launch', app.getVersion())
      launchSent = true
    }
  })
}

function setDarkModeForDashboard (darkMode) {
  if (dashboardWindow) dashboardWindow.webContents.send('set-dark-mode', darkMode)
}

function reloadRecents () {
  if (dashboardWindow) dashboardWindow.webContents.send('pls-reload-recents')
}

module.exports = { openDashboard, setDarkModeForDashboard, reloadRecents }

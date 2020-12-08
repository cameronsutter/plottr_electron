const path = require('path')
const { app } = require('electron')
const { filePrefix } = require('../helpers')
const { windows } = require('./')
const { makeBrowserWindow } = require('../utils')

// mixpanel tracking
let launchSent = false

let dashboardWindow
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
  dashboardWindow.webContents.send('set-dark-mode', darkMode)
}

module.exports = { openDashboard, setDarkModeForDashboard }

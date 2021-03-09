const path = require('path')
const { app, ipcMain } = require('electron')
const { is } = require('electron-util')
const { filePrefix } = require('../helpers')
const { hasWindows } = require('./')
const { makeBrowserWindow } = require('../utils')
const { getDarkMode } = require('../theme')
const log = require('electron-log')

// mixpanel tracking
let launchSent = false

let dashboardWindow
ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
  reloadRecents()
})

ipcMain.on('pls-open-dashboard', () => {
  openDashboard()
})

function openDashboard() {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const htmlPath = is.development
    ? path.resolve('.', 'bin', 'dashboard.html')
    : path.resolve('.', 'dashboard.html')
  log.error('__dirname', __dirname)
  log.error('dev dashboardFile', path.resolve('.', 'bin', 'dashboard.html'))
  log.error('prod dashboardFile', path.resolve('.', 'dashboard.html'))
  log.error('dashboardFile', htmlPath)
  const dashboardFile = filePrefix(htmlPath)
  dashboardWindow = makeBrowserWindow('dashboard')
  dashboardWindow.loadURL(dashboardFile)

  dashboardWindow.on('close', function () {
    dashboardWindow = null
    if (!hasWindows() && !is.macos) {
      app.quit()
    }
  })

  dashboardWindow.webContents.on('did-finish-load', () => {
    dashboardWindow.webContents.send('set-dark-mode', getDarkMode())
    if (!launchSent) {
      dashboardWindow.webContents.send('send-launch', app.getVersion())
      launchSent = true
    }
  })
}

function getDashboardId() {
  return dashboardWindow ? dashboardWindow.id : null
}

function reloadRecents() {
  if (dashboardWindow) dashboardWindow.webContents.send('reload-recents')
}

function reloadDashboard() {
  if (dashboardWindow) dashboardWindow.webContents.send('reload')
}

function updateOpenFiles(filePath) {
  if (dashboardWindow) dashboardWindow.webContents.send('file-closed', filePath)
}

module.exports = {
  openDashboard,
  reloadRecents,
  updateOpenFiles,
  reloadDashboard,
  getDashboardId,
}

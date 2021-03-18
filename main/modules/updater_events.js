const { ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const SETTINGS = require('./settings')
const { sendToDashboard } = require('./windows/dashboard')

autoUpdater.logger = log
autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')
autoUpdater.autoDownload = SETTINGS.get('user.autoDownloadUpdate')

////////////////////
// RECEIVE EVENTS //
////////////////////
ipcMain.on('pls-download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('pls-quit-and-install', () => {
  autoUpdater.quitAndInstall(true, true)
})

ipcMain.on('pls-check-for-updates', () => {
  autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')
  autoUpdater.autoDownload = SETTINGS.get('user.autoDownloadUpdate')
  autoUpdater.checkForUpdates()
})

/////////////////
// SEND EVENTS //
/////////////////
autoUpdater.on('error', (error) => {
  sendToDashboard('updater-error', error)
})

autoUpdater.on('update-available', (info) => {
  sendToDashboard('updater-update-available', info)
})

autoUpdater.on('update-not-available', () => {
  sendToDashboard('updater-update-not-available', null)
})

autoUpdater.on('download-progress', (progress) => {
  sendToDashboard('updater-download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  sendToDashboard('updater-update-downloaded', info)
})

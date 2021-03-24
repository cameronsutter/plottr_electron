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
  log.info('updater-downloadUpdate')
  autoUpdater.downloadUpdate()
})

ipcMain.on('pls-quit-and-install', () => {
  log.info('updater-quit&install')
  autoUpdater.quitAndInstall(true, true)
})

ipcMain.on('pls-check-for-updates', () => {
  log.info('updater-checkForUpdates')
  autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')
  autoUpdater.autoDownload = SETTINGS.get('user.autoDownloadUpdate')
  autoUpdater.checkForUpdates()
})

/////////////////
// SEND EVENTS //
/////////////////
autoUpdater.on('error', (error) => {
  log.info('updater-error')
  sendToDashboard('updater-error', error)
})

autoUpdater.on('update-available', (info) => {
  log.info('updater-update-available')
  sendToDashboard('updater-update-available', info)
})

autoUpdater.on('update-not-available', () => {
  log.info('updater-update-not-available')
  sendToDashboard('updater-update-not-available', null)
})

autoUpdater.on('download-progress', (progress) => {
  log.info('updater-download-progress')
  sendToDashboard('updater-download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('updater-update-downloaded')
  sendToDashboard('updater-update-downloaded', info)
})

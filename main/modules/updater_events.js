import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { broadcastToAllWindows } from './broadcast'
import currentSettings from './settings'

log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.allowPrerelease = false
autoUpdater.autoDownload = false

currentSettings()
  .then((settings) => {
    autoUpdater.allowPrerelease = settings.allowPrerelease
    autoUpdater.autoDownload = settings.user?.autoDownloadUpdate
  })
  .catch((error) => {
    log.error('Error setting initial update settings', error)
  })

////////////////////
// RECEIVE EVENTS //
////////////////////
ipcMain.on('pls-download-update', (event, replyChannel) => {
  autoUpdater
    .downloadUpdate()
    .then(() => {
      event.sender.send(replyChannel, 'heard')
    })
    .catch((error) => {
      log.error('Failed to start downloading update', error)
      event.sender.send(replyChannel, { error: error.message })
    })
})

ipcMain.on('pls-quit-and-install', (event, replyChannel) => {
  try {
    // Reply first so that the renderer can deregister its listener.
    event.sender.send(replyChannel, 'done')
    autoUpdater.quitAndInstall(true, true)
  } catch (error) {
    log.error('Failed to quit and install an update', error)
    event.sender.send(replyChannel, { error: error.message })
  }
})

ipcMain.on('pls-check-for-updates', (event, replyChannel) => {
  currentSettings()
    .then((settings) => {
      autoUpdater.allowPrerelease = settings.allowPrerelease
      autoUpdater.autoDownload = settings.user?.autoDownloadUpdate
      autoUpdater.checkForUpdates()
      event.sender.send(replyChannel, 'done')
    })
    .catch((error) => {
      log.error('Error checking for updates', error)
      event.sender.send(replyChannel, { error: error.message })
    })
})

/////////////////
// SEND EVENTS //
/////////////////
autoUpdater.on('error', (error) => {
  broadcastToAllWindows('updater-error', error)
})

autoUpdater.on('update-available', (info) => {
  broadcastToAllWindows('updater-update-available', info)
})

autoUpdater.on('update-not-available', () => {
  broadcastToAllWindows('updater-update-not-available', null)
})

autoUpdater.on('download-progress', (progress) => {
  broadcastToAllWindows('updater-download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  broadcastToAllWindows('updater-update-downloaded', info)
})

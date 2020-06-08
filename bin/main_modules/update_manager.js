const SETTINGS = require('./settings')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const { ipcMain } = require('electron')

class UpdateManager {
  windows = []

  constructor () {
    autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')
    autoUpdater.logger = log
    autoUpdater.autoDownload = false
    // /////
    // autoUpdater events
    // /////
    autoUpdater.on('error', error => {
      log.warn(error)
      this.notifyAllWindows('updater-error', null)
    })
    autoUpdater.on('update-available', info => this.notifyAllWindows('updater-update-available', info))
    autoUpdater.on('update-not-available', () => this.notifyAllWindows('updater-update-not-available', null))
    autoUpdater.on('update-downloaded', info => this.notifyAllWindows('updater-downloaded', info))
    autoUpdater.on('download-progress', (progress) => this.notifyAllWindows('updater-download-progress', {progress}))
    // /////
    // ipcMain events
    // /////
    ipcMain.on('updater-doTheThing', () => autoUpdater.downloadUpdate())
    ipcMain.on('updater-ZhuLi-doTheThing', () => autoUpdater.quitAndInstall(true, true))
  }

  checkForUpdates = (windows) => {
    this.windows = windows
    this.notifyAllWindows('updater-checking', null)
    autoUpdater.checkForUpdates()
  }

  notifyAllWindows = (channel, data) => {
    // log.info('sending to', channel, data)
    this.windows.forEach(win => win.window.webContents.send(channel, data))
  }

  updateWindows = (theWindows) => {
    this.windows = theWindows
  }
}

const UM = new UpdateManager()

module.exports = UM
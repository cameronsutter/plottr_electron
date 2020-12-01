const path = require('path');
const { BrowserWindow } = require('electron');
const { filePrefix } = require('../helpers');
const {
  preventsQuitting,
  closeWindow,
} = require('../windows');
const SETTINGS = require('../settings');

let expiredWindow;
const openExpiredWindow = preventsQuitting(() => {
  const expiredFile = path.join(filePrefix(__dirname), '../../expired.html')
  expiredWindow = new BrowserWindow({
    height: 600,
    width: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })
  expiredWindow.loadURL(expiredFile)
  if (SETTINGS.get('forceDevTools')) {
    expiredWindow.openDevTools()
  }
  expiredWindow.once('ready-to-show', function() {
    this.show()
  })
  expiredWindow.on('close', function () {
    expiredWindow = null
  })
})

function closeExpiredWindow () {
  if (expiredWindow == null) return;
  expiredWindow.close();
  expiredWindow = null;
}

module.exports = {
  openExpiredWindow,
  closeExpiredWindow,
};

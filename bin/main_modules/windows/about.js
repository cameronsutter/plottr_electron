const path = require('path');
const { BrowserWindow } = require('electron');
const SETTINGS = require('../settings')
const { filePrefix } = require('../helpers');

let aboutWindow;

function openAboutWindow () {
  if (aboutWindow) {
    aboutWindow.focus()
    return
  }

  const aboutFile = path.join(filePrefix(__dirname), '../../about.html')
  aboutWindow = new BrowserWindow({
    width: 350,
    height: 566,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })
  aboutWindow.loadURL(aboutFile)
  if (SETTINGS.get('forceDevTools')) {
    aboutWindow.openDevTools()
  }
  aboutWindow.once('ready-to-show', function() {
    this.show()
  })
  aboutWindow.on('closed', function () {
    aboutWindow = null
  })
}

module.exports = {
  openAboutWindow,
}

const path = require('path')
const { BrowserWindow } = require('electron')
const { closeWindow, preventsQuitting } = require('./')
const { filePrefix } = require('../helpers')
const SETTINGS = require('../settings')

let verifyWindow
const openVerifyWindow = preventsQuitting(() => {
  const verifyFile = path.join(filePrefix(__dirname), '../../verify.html')
  verifyWindow = new BrowserWindow({
    height: 425,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })
  verifyWindow.loadURL(verifyFile)
  if (SETTINGS.get('forceDevTools')) {
    verifyWindow.openDevTools()
  }
  verifyWindow.once('ready-to-show', function() {
    this.show()
  })
  verifyWindow.on('close', function () {
    verifyWindow = null
  })
})

function closeVerifyWindow() {
  if (verifiedWindow == null) return
  closeWindow(verifiedWindow.id)
  verifiedWindow = null
}

module.exports = {
  openVerifyWindow,
  closeVerifyWindow,
}

const { app, BrowserWindow, Menu, ipcMain, dialog,
  nativeTheme, globalShortcut, shell, screen } = require('electron')
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
const contextMenu = require('electron-context-menu')
const windowStateKeeper = require('electron-window-state')
const setupRollbar = require('./main_modules/rollbar')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})
const rollbar = setupRollbar('main', {})

let dashboardWindow = null
let windows = []

let darkMode = nativeTheme.shouldUseDarkColors || false
const filePrefix = is.windows ? __dirname : 'file://' + __dirname

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => []
})

if (process.env.NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function(sendErr, data) {
      gracefullyQuit()
    })
  })
}

app.whenReady().then(() => {
  openDashboard()

  app.on('activate', function () {
    if (windows.length) {
      windows[0].browserWindow.focus()
    } else {
      openDashboard()
    }
  })
})

app.on('window-all-closed', function () {
  openDashboard()
})

function openDashboard () {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const dashboardFile = path.join(filePrefix, 'dashboard.html')
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * 0.8),
    defaultHeight: parseInt(height * 0.8),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: 'dashboard',
  })

  dashboardWindow = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })

  dashboardWindow.loadURL(dashboardFile)
  if (process.env.NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    dashboardWindow.openDevTools()
  }
  dashboardWindow.once('ready-to-show', function() {
    this.show()
  })
  dashboardWindow.on('close', function () {
    dashboardWindow = null
    if (!windows.length) {
      app.quit()
    }
  })
}

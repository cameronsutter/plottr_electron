const electron = require('electron')
const { app, BrowserWindow, ipcMain, globalShortcut } = electron
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
require('./modules/updater_events')
const contextMenu = require('electron-context-menu')
const { setupRollbar } = require('./modules/rollbar')
const { loadMenu } = require('./modules/menus')
const { setupI18n } = require('plottr_locales')
const {
  focusFirstWindow,
  hasWindows,
  getWindowById,
  numberOfWindows,
} = require('./modules/windows')
const { openProjectWindow } = require('./modules/windows/projects')
const { setDarkMode, broadcastDarkMode } = require('./modules/theme')
const { newFileOptions } = require('./modules/new_file_options')
const { gracefullyQuit } = require('./modules/utils')
const { openDashboard } = require('./modules/windows/dashboard')
const { addToKnown } = require('./modules/known_files')
const SETTINGS = require('./modules/settings')
const {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
} = require('./modules/feature_flags')
const { reloadAllWindows } = require('./modules/windows')
const { reloadDashboard } = require('./modules/windows/dashboard')

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
const ENV_FILE_PATH = path.resolve('.env')
require('dotenv').config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})
setupI18n(SETTINGS, { electron })

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (!is.development) {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function (sendErr, data) {
      gracefullyQuit()
    })
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }
}

app.whenReady().then(() => {
  loadMenu(true)
  openDashboard()
  windowsOpenFileEventHandler(process.argv)

  // Register the toggleDevTools shortcut listener.
  globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  if (process.env.NODE_ENV != 'dev') {
    app.setAsDefaultProtocolClient('plottr')
  }

  app.on('activate', () => {
    if (hasWindows()) {
      focusFirstWindow()
    } else {
      openDashboard()
    }
  })
  app.on('second-instance', (event, argv, workingDirectory) => {
    log.info('second-instance')
    loadMenu(true)
    openDashboard()
    windowsOpenFileEventHandler(argv)
  })
})

function windowsOpenFileEventHandler(argv) {
  if (is.windows && process.env.NODE_ENV != 'dev') {
    log.info('windows open-file event handler')
    log.info('args', argv.length, argv)
    const param = argv[argv.length - 1]

    if (param.includes('.pltr')) {
      openProjectWindow(param)
      addToKnown(param)
    }

    // windows custom protocol link handler
    // log.info('open-url event: ' + param)
    // const link = param.replace('plottr://')
  }
}

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  // mac/linux open-file event handler
  app.whenReady().then(() => {
    openProjectWindow(filePath)
    addToKnown(filePath)
  })
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})

app.on('window-all-closed', function () {
  if (!is.macos) {
    openDashboard()
  }
})

ipcMain.on('pls-fetch-state', function (event, id) {
  const win = getWindowById(id)
  if (win) {
    event.sender.send('state-fetched', win.filePath, newFileOptions(), numberOfWindows())
  }
})

ipcMain.on('pls-set-dark-setting', (_, newValue) => {
  setDarkMode(newValue)
  broadcastDarkMode()
})

ipcMain.on('pls-update-beat-hierarchy-flag', (_, newValue) => {
  if (newValue) {
    broadcastSetBeatHierarchy()
  } else {
    broadcastUnsetBeatHierarchy()
  }
})

ipcMain.on('pls-update-language', (_, newLanguage) => {
  SETTINGS.set('locale', newLanguage)
  setupI18n(SETTINGS, { electron })
  require('./modules/menus').loadMenu()
  reloadAllWindows()
  reloadDashboard()
})

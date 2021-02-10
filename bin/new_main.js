const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
const contextMenu = require('electron-context-menu')
const { setupRollbar } = require('./main_modules/rollbar')
const { loadMenu } = require('./main_modules/menus')
const { setupI18n } = require('../locales')
const {
  focusFirstWindow,
  hasWindows,
  getWindowById,
  numberOfWindows,
} = require('./main_modules/windows')
const { openProjectWindow } = require('./main_modules/windows/projects')
const { getDarkMode } = require('./main_modules/theme')
const { gracefullyQuit } = require('./main_modules/utils')
const { openDashboard } = require('./main_modules/windows/dashboard')
const { addToKnown } = require('./main_modules/known_files')
const SETTINGS = require('./main_modules/settings')

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})
setupI18n(SETTINGS)

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (process.env.NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function (sendErr, data) {
      gracefullyQuit()
    })
  })
}

if (process.env.NODE_ENV === 'dev') {
  try {
    require('electron-reloader')(module, { ignore: ['examples', 'src', '.*#.*#'], debug: true })
  } catch (e) {
    console.error('Error while instrumenting app for reload.', e)
  }
}

app.whenReady().then(() => {
  loadMenu(true)
  openDashboard()

  // windows open-file event handler
  if (is.windows && process.argv.length == 2 && process.env.NODE_ENV != 'dev') {
    const param = process.argv[1]

    if (param.includes('.pltr')) {
      openProjectWindow(param)
      addToKnown(param)
    }

    // windows custom protocol link handler
    log.info('open-url event: ' + param)
    // const link = param.replace('plottr://')
  }

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
})

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
    event.sender.send('state-fetched', win.filePath, getDarkMode(), numberOfWindows())
  }
})

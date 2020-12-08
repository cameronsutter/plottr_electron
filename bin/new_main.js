const { app, BrowserWindow, Menu, ipcMain, dialog,
  nativeTheme, globalShortcut, shell, screen } = require('electron')
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
const contextMenu = require('electron-context-menu')
const windowStateKeeper = require('electron-window-state')
const { setupRollbar } = require('./main_modules/rollbar')
const { loadMenu } = require('./main_modules/menus')
const { setupI18n } = require('../locales')
const { getWindowById } = require('./main_modules/windows')
const { getDarkMode } = require('./main_modules/theme')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})
const rollbar = setupRollbar('main', {})

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
setupI18n()

let dashboardWindow = null
let windows = []

const filePrefix = is.windows ? __dirname : 'file://' + __dirname

// mixpanel tracking
let launchSent = false

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
  loadMenu(true)

  // windows open-file event handler
  if (is.windows && process.argv.length == 2 && process.env.NODE_ENV != 'dev') {
    const param = process.argv[1]

    if (param.includes('.pltr')) {
      openWindow(param)
    }

    // windows custom protocol link handler
    log.info("open-url event: " + param)
    // const link = param.replace('plottr://')
  }

  app.on('activate', () => {
    if (windows.length) {
      const browserWin = BrowserWindow.fromId(windows[0].id)
      if (browserWin) browserWin.focus()
    } else {
      openDashboard()
    }
  })
})

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  // mac/linux open-file event handler
  if (!is.windows) {
    app.whenReady().then(() => {
      openWindow(filePath)
    })
  }
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info("open-url event: " + url)
  // const link = param.replace('plottr://')
})

app.on('window-all-closed', function () {
  if (!is.macos) {
    openDashboard()
  }
})

ipcMain.on('pls-open-window', (event, filePath, jsonData) => {
  openWindow(filePath, jsonData, null)
})

ipcMain.on('pls-fetch-state', function (event, id) {
  var win = windows.find(w => w.id == id)
  if (win) {
    event.sender.send('state-fetched', win.filePath, getDarkMode(), windows.length)
  }
})

ipcMain.on('pls-reload-menu', () => {
  loadMenu()
})

function openDashboard () {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const dashboardFile = path.join(filePrefix, 'dashboard.html')
  dashboardWindow = makeBrowserWindow('dashboard')

  dashboardWindow.loadURL(dashboardFile)

  dashboardWindow.on('close', function () {
    dashboardWindow = null
    if (!windows.length && !is.macos) {
      app.quit()
    }
  })
  dashboardWindow.webContents.on('did-finish-load', () => {
    if (!launchSent) {
      dashboardWindow.webContents.send('send-launch', app.getVersion())
      launchSent = true
    }
  })
}

function openWindow (filePath) {
  const newWindow = makeBrowserWindow(filePath)

  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)

  // newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) // depends on 'this' being the window
    if (win) dereferenceWindow(win)
  })

  try {
    app.addRecentDocument(filePath)

    windows.push({
      id: newWindow.id,
      browserWindow: newWindow,
      filePath: filePath,
    })
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {filePath: filePath})
    newWindow.destroy()
  }
}

function dereferenceWindow (winObj) {
  windows = windows.filter(win => win.id != winObj.id)
}

// TODO: this could be in it's own module
function makeBrowserWindow (filePath) {
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeprFile = filePath.replace(/[\/\\]/g, '~')
  const numFileLetters = 100

  let multiplier = filePath == 'dashboard' ? 0.8 : 0.9

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * multiplier),
    defaultHeight: parseInt(height * multiplier),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeprFile.slice(-numFileLetters),
  })

  let config = {
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true,
      enableRemoteModule: true,
      webviewTag: true,
    }
  }

  if (filePath == 'dashboard') {
    config.titleBarStyle = 'hiddenInset'
  } else {
    config.backgroundColor = '#f7f7f7'
  }

  // Create the browser window
  let newWindow = new BrowserWindow(config)

  // register listeners on the window
  stateKeeper.manage(newWindow)

  newWindow.once('ready-to-show', function() {
    this.show() // depends on 'this' being the window
  })

  newWindow.webContents.on('unresponsive', () => {
    log.warn('webContents became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.on('unresponsive', () => {
    log.warn('window became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  if (process.env.NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  return newWindow
}

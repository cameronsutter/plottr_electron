const { app, BrowserWindow, Menu, ipcMain, dialog,
  nativeTheme, globalShortcut, shell, screen } = require('electron')
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
const contextMenu = require('electron-context-menu')
const windowStateKeeper = require('electron-window-state')
const setupRollbar = require('./main_modules/rollbar')
// const { backupFile } = require('./main_modules/backup')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})
const rollbar = setupRollbar('main', {})

let dashboardWindow = null
let windows = []

let darkMode = nativeTheme.shouldUseDarkColors || false
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

  app.on('activate', function () {
    if (windows.length) {
      const browserWin = BrowserWindow.fromId(windows[0].id)
      if (browserWin) browserWin.focus()
    } else {
      openDashboard()
    }
  })
})

app.on('window-all-closed', function () {
  openDashboard()
})

ipcMain.on('pls-open-window', (event, filePath, jsonData) => {
  openWindow(filePath, jsonData, null)
})

ipcMain.on('pls-fetch-state', function (event, id) {
  var win = windows.find(w => w.id == id)
  if (win) {
    win.browserWindow.setTitle(displayFileName(win.filePath))
    win.browserWindow.setRepresentedFilename(win.filePath)

    event.sender.send('state-fetched', win.filePath, darkMode, windows.length)
  }
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

// TODO:
// - askToSave
// - backup

function openWindow (filePath) {
  const newWindow = makeBrowserWindow(filePath)

  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)

  // newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    const win = windows.find(w => w.id == this.id) // depends on 'this' being the window

    // if (win && win.state && isDirty(win.state, win.lastSave)) {
    //   e.preventDefault()
    //   const _this = this
    //   askToSave(this, win.state, win.filePath, function() {
    //     dereferenceWindow(win)
    //     _this.destroy()
    //   })
    // } else {
    //   dereferenceWindow(win)
    // }
  })

  try {
    // let json = jsonData ? jsonData : JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    app.addRecentDocument(filePath)
    // backupFile(filePath, json, (err) => {
    //   if (err) {
    //     log.warn('[file open backup]', err)
    //     rollbar.error({message: 'BACKUP failed'})
    //     rollbar.warn(err, {filePath: filePath})
    //   } else {
    //     log.info('[file open backup]', 'success', filePath)
    //   }
    // })

    windows.push({
      id: newWindow.id,
      browserWindow: newWindow,
      filePath: filePath,
    })
    newWindow.setTitle(displayFileName(filePath))
    newWindow.setRepresentedFilename(filePath)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {filePath: filePath})
    newWindow.destroy()
  }
}

function dereferenceWindow (winObj) {
  windows = windows.filter(win => win.id != winObj.id)
}

// TODO: days left in trial mode?
function displayFileName (filePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  return `Plottr${baseFileName}${devMessage}`
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
    this.show()
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

const path = require('path')
const fs = require('fs')
const { screen, app, shell, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')
const log = require('electron-log')
const { reject } = require('lodash')
const { askToSave } = require('../utils')
const FileManager = require('../file_manager')
const { isDirty, filePrefix, displayFileName } = require('../helpers')
const UpdateManager = require('../update_manager')
const { backupFile } = require('../backup')
const { rollbar } = require('../rollbar')
const { NODE_ENV, TRIAL_MODE } = require('../constants')
const { getDaysLeftInTrial } = require('../trial_manager')
const SETTINGS = require('../settings')

const windows = []

// mixpanel tracking
let launchSent = false

function getWindowById(id) {
  return windows.find(window => window.id === id)
}

function openWindow (fileName, jsonData, importFrom) {
  log.info('openWindow', fileName)
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeperFile = fileName.replace(/[\/\\]/g, '~')
  const numFileLetters = 100

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * 0.9),
    defaultHeight: parseInt(height * 0.9),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeperFile.slice(-numFileLetters),
  })

  // Create the browser window.
  let newWindow = new BrowserWindow({
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    backgroundColor: '#f7f7f7',
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true,
      enableRemoteModule: true,
    }
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  stateKeeper.manage(newWindow)

  // and load the app.html of the app.
  const entryFile = path.join(filePrefix(__dirname), '../../app.html')
  newWindow.loadURL(entryFile)


  newWindow.once('ready-to-show', function() {
    this.show()
  })

  // // at this point, verification will always be done
  // dontQuit = false

  newWindow.webContents.on('did-finish-load', () => {
    // launch wouldn't be sent if they have another file open
    if (!launchSent) {
      newWindow.webContents.send('send-launch', app.getVersion(), TRIAL_MODE, getDaysLeftInTrial())
    }
  })

  newWindow.webContents.on('unresponsive', () => {
    log.warn('webContents became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.on('unresponsive', () => {
    log.warn('window became unresponsive')
    newWindow.webContents.reload()
  })

  if (NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    let win = getWindowById(this.id) // depends on 'this' being the window

    // closing the window, but not trying to quit
    // only remove from open windows if there's more than one window open
    if (windows.length > 1 && win) {
      FileManager.close(win.fileName)
    }

    if (win && win.state && isDirty(win.state, win.lastSave)) {
      e.preventDefault()
      askToSave(this, win.state, win.fileName, function() {
        dereferenceWindow(win)
      })
    } else {
      dereferenceWindow(win)
    }
  })

  newWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  try {
    let json = jsonData ? jsonData : JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    log.info('openWindow. json?', !!json)
    app.addRecentDocument(fileName)
    FileManager.open(fileName)
    backupFile(fileName, json, (err) => {
      if (err) {
        log.warn('[file open backup]', err)
        rollbar.error({message: 'BACKUP failed'})
        rollbar.warn(err, {fileName: fileName})
      } else {
        log.info('[file open backup]', 'success', fileName)
      }
    })

    windows.push({
      id: newWindow.id,
      window: newWindow,
      fileName: fileName,
      state: json,
      lastSave: json,
      importFrom,
    })
    UpdateManager.updateWindows(windows)
    newWindow.setTitle(displayFileName(fileName))
    newWindow.setRepresentedFilename(fileName)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: fileName})
    FileManager.close(fileName)
    newWindow.destroy()
  }
}

function reloadWindow () {
  let win = BrowserWindow.getFocusedWindow()
  let winObj = getWindowById(win.id)
  if (NODE_ENV !== 'dev') {
    if (isDirty(winObj.state, winObj.lastSave)) {
      askToSave(win, winObj.state, winObj.fileName, win.webContents.reload)
    } else {
      win.webContents.reload()
    }
  } else {
    win.webContents.reload()
  }
}

function dereferenceWindow (winObj) {
  const index = windows.findIndex(win => win.id === winObj.id)
  windows.splice(index, 1)
  UpdateManager.updateWindows(windows)
}

function closeWindow (id) {
  let win = getWindowById(id)
  win.window.close()
}

let dontQuit = false
function preventsQuitting(fn) {
  return (...args) => {
    dontQuit = true
    fn(...args)
    dontQuit = false
  }
}

function canQuit() {
  return !dontQuit
}

module.exports = {
  openWindow,
  reloadWindow,
  dereferenceWindow,
  closeWindow,
  preventsQuitting,
  canQuit,
  getWindowById,
  windows,
}

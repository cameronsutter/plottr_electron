const { app, BrowserWindow, Menu, ipcMain, dialog,
  systemPreferences, globalShortcut, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const deep = require('deep-diff')
const _ = require('lodash')
const storage = require('electron-json-storage')
const log = require('electron-log')
const i18n = require('format-message')
const windowStateKeeper = require('electron-window-state')
const { autoUpdater } = require('electron-updater')
const Migrator = require('./migrator/migrator')
const Exporter = require('./main_modules/exporter')
const { USER_INFO_PATH, RECENT_FILES_PATH } = require('./main_modules/config_paths')
const enterCustomerServiceCode = require('./main_modules/customer_service_codes')
const { checkTrialInfo, turnOffTrialMode, startTheTrial, extendTheTrial } = require('./main_modules/trial_manager')
const backupFile = require('./main_modules/backup')
const createErrorReport = require('./main_modules/error_report')
const setupRollbar = require('./main_modules/rollbar')
const rollbar = setupRollbar('main')
const SETTINGS = require('./main_modules/settings')
const checkForActiveLicense = require('./main_modules/license_checker')
if (process.env.NODE_ENV === 'dev') {
  // require('electron-reload')(path.join('..'))
}

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})

let TRIALMODE = process.env.TRIALMODE === 'true'
let DAYS_LEFT = null
var USER_INFO = {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windows = []
var aboutWindow = null
var verifyWindow = null
var expiredWindow = null

var fileToOpen = null
var dontquit = false
var tryingToQuit = false
var darkMode = systemPreferences.isDarkMode() || false

const filePrefix = process.platform === 'darwin' ? 'file://' + __dirname : __dirname
const recentKey = process.env.NODE_ENV === 'dev' ? 'recentFilesDev' : RECENT_FILES_PATH

// auto updates
let lastCheckedForUpdate = new Date().getTime()
const updateCheckThreshold = 1000 * 60 * 60
log.transports.file.level = 'info'
autoUpdater.logger = log

// mixpanel tracking
var launchSent = false

////////////////////////////////
////     Bug Reporting    //////
////////////////////////////////

if (process.env.NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function(sendErr, data) {
      gracefullyQuit()
    })
  })
}

// TODO: Report crashes to our server.

////////////////////////////////
///////     EVENTS    //////////
////////////////////////////////

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    if (!dontquit) app.quit()
  }
})

app.on('open-file', (event, path) => {
  // do the file opening here
  if (app.isReady()) {
    openWindow(path)
  } else {
    fileToOpen = path
  }
  event.preventDefault()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.length === 0) {
    checkLicense(() => {})
  }
})

app.on('browser-window-focus', () => {
  const currentTime = new Date().getTime()
  if (currentTime - lastCheckedForUpdate > updateCheckThreshold) {
    checkForUpdates()
    lastCheckedForUpdate = currentTime
  }
})

ipcMain.on('save-state', (event, state, winId, isNewFile) => {
  var winObj = _.find(windows, {id: winId})
  let wasEdited = isDirty(state, winObj.state)
  winObj.window.setDocumentEdited(wasEdited)
  winObj.window.setTitle(displayFileName(winObj.fileName))
  winObj.window.setRepresentedFilename(winObj.fileName)

  // save the new state
  winObj.state = state
  if (isNewFile || wasEdited) {
    saveFile(winObj.fileName, state, function (err) {
      backupFile(winObj.fileName, state, () => {})
      if (err) {
        log.warn(err)
        log.warn('file name: ' + winObj.fileName)
        rollbar.warn(err, {fileName: winObj.fileName})
        gracefullyNotSave()
      } else {
        winObj.window.webContents.send('state-saved')
        winObj.lastSave = winObj.state
        winObj.window.setDocumentEdited(false)
      }
    })
  } else winObj.window.webContents.send('state-saved')
})

ipcMain.on('fetch-state', function (event, id) {
  var win = _.find(windows, {id: id})
  win.window.setProgressBar(0.99)
  if (win.state.file) {
    win.window.setTitle(displayFileName(win.fileName))
    win.window.setRepresentedFilename(win.fileName)
  }

  if (win.window.isVisible()) {
    migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
      if (err) { log.warn(err); rollbar.warn(err) }
      win.window.setProgressBar(-1)
      event.sender.send('state-fetched', json, win.fileName, dirty, darkMode, windows.length)
    })
  } else {
    win.window.on('show', () => {
      migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
        if (err) { log.warn(err); rollbar.warn(err) }
        win.window.setProgressBar(-1)
        event.sender.send('state-fetched', json, win.fileName, dirty, darkMode, windows.length)
      })
    })
  }
})

ipcMain.on('reload-window', function (event, id, state) {
  let winObj = _.find(windows, {id: id})
  if (winObj) {
    saveFile(winObj.fileName, state, function(err, data) {
      if (err) { log.warn(err); rollbar.warn(err) }
      winObj.state = state
      winObj.window.webContents.reload()
    })
  }
})

ipcMain.on('launch-sent', function (event) {
  launchSent = true
})

ipcMain.on('open-buy-window', function (event) {
  if (expiredWindow) expiredWindow.close()
  openBuyWindow()
})

function licenseVerified (ask) {
  if (verifyWindow) verifyWindow.close()
  if (TRIALMODE) {
    TRIALMODE = false
    turnOffTrialMode()
    loadMenu()
    if (ask) askToOpenOrCreate()
  } else {
    loadMenu()
    openRecentFiles()
  }
}

ipcMain.on('license-verified', () => {
  licenseVerified(true)
})

ipcMain.on('export', (event, options, winId) => {
  var winObj = _.find(windows, {id: winId})
  Exporter(winObj.state, options)
})

ipcMain.on('start-free-trial', () => {
  if (verifyWindow) verifyWindow.close()
  startTheTrial(daysLeft => {
    TRIALMODE = true
    DAYS_LEFT = daysLeft
    loadMenu()
    createAndOpenEmptyFile()
  })
})

ipcMain.on('extend-trial', (event, days) => {
  extendTheTrial(days, (error) => {
    if (error) {
      expiredWindow.close()
      dialog.showErrorBox(i18n('Error'), i18n('Extending your trial didn\'t work. Let\'s try again.'))
      openExpiredWindow()
    } else {
      if (expiredWindow) expiredWindow.close()
      DAYS_LEFT += days
      loadMenu()
      windows.forEach(winObj => {
        winObj.window.setTitle(displayFileName(winObj.fileName))
      })
    }
  })
})

app.on('ready', () => {
  i18n.setup({
    translations: require('../locales'),
    locale: app.getLocale() || 'en'
  })

  if (process.platform === 'darwin') {
    loadMenu(true)
  }

  // Register the toggleDevTools shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  checkLicense(() => {
    loadMenu()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

////////////////////////////////
///////   FUNCTIONS   //////////
////////////////////////////////

function checkForUpdates () {
  if (process.env.NODE_ENV !== 'dev') {
    autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')
    autoUpdater.checkForUpdatesAndNotify()
  }
}

function checkLicense (callback) {
  storage.has(USER_INFO_PATH, function (err, hasKey) {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(USER_INFO_PATH, function (err, data) {
        if (err) log.error(err)
        USER_INFO = data
        if (TRIALMODE) {
          if (data.success) {
            TRIALMODE = false
            turnOffTrialMode()
          }
          callback()
          openRecentFiles()
          if (process.env.useEDD === 'true') {
            // do this in the background
            // will have to think how to handle open windows if not valid
            checkForActiveLicense(USER_INFO, valid => {
              if (!valid) openVerifyWindow()
            })
          }
        } else {
          callback()
          if (data.success) openRecentFiles()
          else openVerifyWindow()
        }
      })
    } else {
      // no license yet, check for trial info
      checkTrialInfo(daysLeft => {
        TRIALMODE = true
        DAYS_LEFT = daysLeft
        callback()
        openRecentFiles()
      }, openVerifyWindow, openExpiredWindow)
    }
  })
}

function saveFile (fileName, data, callback) {
  var stringState = JSON.stringify(data, null, 2)
  fs.writeFile(fileName, stringState, callback)
}

function displayFileName (path) {
  var stringBase = 'Plottr'
  if (TRIALMODE) stringBase += ' — ' + i18n('TRIAL Version') + ' (' + i18n('{days} days remaining', {days: DAYS_LEFT}) + ')'
  var matches = path.match(/.*\/(.*\.pltr)/)
  if (matches) stringBase += ` — ${matches[1]}`
  return stringBase
}

function isDirty (newState, oldState) {
  const diff = deep.diff(oldState, newState) || []
  let edited = false
  if (newState.file && newState.file.dirty && diff.length > 0) edited = true
  return edited
}

function openRecentFiles () {
  // open-file for windows
  if (process.platform === 'win32' && process.argv.length == 2) {
    if (process.argv[1].includes('.pltr')) {
      openWindow(process.argv[1])
    }
  } else if (fileToOpen) {
    openWindow(fileToOpen)
    fileToOpen = null
  } else {
    storage.has(recentKey, function (err, hasKey) {
      if (err) { log.warn(err); rollbar.warn(err) }
      if (hasKey) {
        storage.get(recentKey, function (err, fileName) {
          if (err) { log.warn(err); rollbar.warn(err) }
          openWindow(fileName)
        })
      } else {
        askToOpenOrCreate()
      }
    })
  }
}

function askToSave (win, state, fileName, callback) {
  dialog.showMessageBox(win, {type: 'question', buttons: [i18n('yes, save!'), i18n('no, just exit')], defaultId: 0, message: i18n('Would you like to save before exiting?')}, function (choice) {
    if (choice === 0) {
      saveFile(fileName, state, function (err) {
        if (err) throw err
        else {
          if (typeof callback === 'string') win[callback]()
          else callback()
        }
      })
    } else {
      if (typeof callback === 'string') win[callback]()
      else callback()
    }
  })
}

function askToCreateFile () {
  dialog.showSaveDialog({title: i18n('Where would you like to start your new file?')}, function (fileName) {
    if (fileName) {
      var fullName = fileName + '.pltr'
      openWindow(fullName, true)
      saveFile(fullName, {}, function (err) {
        if (err) {
          log.warn(err)
          log.warn('file name: ' + fullName)
          rollbar.warn(err, {fileName: fullName})
          dialog.showErrorBox(i18n('Saving failed'), i18n("Creating your file didn't work. Let's try again."))
          askToCreateFile()
        } else {
          storage.set(recentKey, fullName, function (err) {
            if (err) console.log(err)
            app.addRecentDocument(fullName)
          })
        }
      })
    }
  })
}

function askToOpenOrCreate () {
  dontquit = true
  dialog.showMessageBox({type: 'question', buttons: ['open', 'new'], message: i18n('Would you like to open an existing file or start a new file?')}, (choice) => {
    if (choice === 0) {
      askToOpenFile()
    } else {
      askToCreateFile()
    }
  })
}

function askToOpenFile () {
  let win = null
  if (windows.length > 0) win = BrowserWindow.getFocusedWindow()
  var properties = [ 'openFile', 'createDirectory' ]
  var filters = [{name: 'Plottr file', extensions: ['pltr']}]
  dialog.showOpenDialog(win, {filters: filters, properties: properties }, function (chosenFileName) {
    if (chosenFileName && chosenFileName.length > 0) {
      openWindow(chosenFileName[0])
    }
  })
}

function openWindow (fileName, newFile = false) {
  // Load the previous state with fallback to defaults
  let stateKeeper = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
    file: fileName,
  });

  // Create the browser window.
  let newWindow = new BrowserWindow({
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    backgroundColor: '#f7f7f7',
    webPreferences: {nodeIntegration: true, spellcheck: true}
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  stateKeeper.manage(newWindow);

  newWindow.setProgressBar(0.1)

  // and load the app.html of the app.
  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)

  newWindow.setProgressBar(0.2)

  newWindow.once('ready-to-show', function() {
    this.setProgressBar(0.75)
    this.show()
  })

  // at this point, verification will always be done
  dontquit = false

  newWindow.webContents.on('did-finish-load', () => {
    // launch wouldn't be sent if they have another file open
    if (!launchSent) {
      newWindow.webContents.send('send-launch', app.getVersion(), TRIALMODE, DAYS_LEFT)
    }
  })

  if (process.env.NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    var win = _.find(windows, {id: this.id})
    if (win && win.state && isDirty(win.state, win.lastSave)) {
      e.preventDefault()
      var _this = this
      askToSave(this, win.state, win.fileName, function() {
        dereferenceWindow(win)
        // TODO: if changes weren't saved (checkDirty(win.state, win.lastSave)), flush the history from local storage
        if (tryingToQuit) app.quit()
        _this.destroy()
      })
    } else {
      dereferenceWindow(win)
    }
  })

  newWindow.setProgressBar(0.4)

  try {
    var json = {}
    if (!newFile) {
      json = JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    }
    newWindow.setProgressBar(0.5)
    app.addRecentDocument(fileName)
    storage.set(recentKey, fileName, error => {
      if (error) console.log(error)
    })

    windows.push({
      id: newWindow.id,
      window: newWindow,
      fileName: fileName,
      state: json,
      lastSave: json
    })
    newWindow.setProgressBar(0.6)
    newWindow.setTitle(displayFileName(fileName))
    newWindow.setRepresentedFilename(fileName)
  } catch (err) {
    log.warn(err)
    log.warn('file name: ' + fileName)
    rollbar.warn(err, {fileName: fileName})
    askToOpenOrCreate()
    removeRecentFile(fileName)
    newWindow.destroy()
  } finally {
    checkForUpdates()
  }
}

function dereferenceWindow (winObj) {
  removeRecentFile(winObj.fileName)
  windows = _.reject(windows, function (win) {
    return win.id === winObj.id
  })
}

function closeWindow (id) {
  let win = _.find(windows, {id: id})
  let windowFile = win.fileName
  win.window.close()
}

function removeRecentFile (fileNameToRemove) {
  storage.get(recentKey, function (err, storedFileName) {
    if (err) console.log(err)
    if (fileNameToRemove === storedFileName) {
      if (windows.length > 1) {
        let newFileName = ''
        for (let i = 0; i < windows.length; i++) {
          let thisWindowFile = windows[i].fileName
          if (thisWindowFile !== fileNameToRemove && thisWindowFile !== storedFileName) {
            newFileName = thisWindowFile
          }
        }
        if (newFileName !== '') {
          storage.set(recentKey, newFileName, function (err, _) {
            if (err) console.log(err)
          })
        }
      }
    }
  })
}

function createAndOpenEmptyFile () {
  let fileName = path.join(app.getPath('documents'), 'plottr_trial.pltr')
  try {
    // see if this file exists already
    let stat = fs.statSync(fileName)
    if (stat) {
      let date = new Date()
      fileName = path.join(app.getPath('documents'), `plottr_trial_${date.getTime()}.pltr`)
    }
  } catch (error) {
    log.warn(error)
  } finally {
    fs.writeFile(fileName, emptyFileContents(), function(err) {
      if (err) {
        log.warn(err)
        rollbar.warn(err)
      } else {
        openWindow(fileName)
      }
    })
  }
}

function emptyFileContents () {
  let data = require('./empty_file.json')
  return JSON.stringify(data, null, 2)
}

function openAboutWindow () {
  const aboutFile = path.join(filePrefix, 'about.html')
  aboutWindow = new BrowserWindow({width: 350, height: 550, show: false, webPreferences: {nodeIntegration: true}})
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

function openVerifyWindow () {
  dontquit = true
  const verifyFile = path.join(filePrefix, 'verify.html')
  verifyWindow = new BrowserWindow({frame: false, height: 425, show: false, webPreferences: {nodeIntegration: true}})
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
}

function openExpiredWindow () {
  dontquit = true
  const expiredFile = path.join(filePrefix, 'expired.html')
  expiredWindow = new BrowserWindow({frame: false, height: 425, width: 700, show: false, webPreferences: {nodeIntegration: true}})
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
}

function openBuyWindow () {
  shell.openExternal("https://gum.co/fgSJ")
}

function gracefullyQuit () {
  dialog.showMessageBox({type: 'info', buttons: [i18n('ok')], message: i18n('Plottr ran into a problem. Try opening Plottr again.'), detail: i18n('If you keep seeing this problem, email me at family@plottrapp.com')}, function (choice) {
    app.quit()
  })
}

function gracefullyNotSave () {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

function takeScreenshot () {
  let win = BrowserWindow.getFocusedWindow()
  if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
  win.capturePage(function (image) {
    if (process.env.NODE_ENV === 'dev') {
      let version = app.getVersion()
      let home = process.platform === 'darwin' ? process.env.HOME : process.env.HOMEPATH
      var folderPath = path.join(home, 'plottr_dist', version, 'screenshots')
      let date = new Date()
      let timestamp = '' + date.getMinutes() + date.getSeconds()
      var fileName = 'shot' + timestamp + '.png'
      var filePath = path.join(folderPath, fileName)
      let stat = fs.stat(folderPath, (err, stat) => {
        if (err) {
          fs.mkdir(folderPath, (err) => {
            if (err) {
              log.error(err)
            } else {
              fs.writeFile(filePath, image.toPNG(), () => {})
            }
          })
        } else {
          if (stat.isDirectory()) {
            fs.writeFile(filePath, image.toPNG(), () => {})
          }
        }
      })
    } else {
      dialog.showSaveDialog(win, function(fileName) {
        if (fileName) fs.writeFile(fileName + '.png', image.toPNG(), () => {})
      })
    }
  })
}

function reloadWindow () {
  let win = BrowserWindow.getFocusedWindow()
  let winObj = _.find(windows, {id: win.id})
  if (process.env.NODE_ENV !== 'dev') {
    if (isDirty(winObj.state, winObj.lastSave)) {
      askToSave(win, winObj.state, winObj.fileName, win.webContents.reload)
    } else {
      win.webContents.reload()
    }
  } else {
    win.webContents.reload()
  }
}

////////////////////////////////
///////    MIGRATE    //////////
////////////////////////////////

function migrateIfNeeded (win, json, fileName, callback) {
  if (!json.file) {
    callback(null, false, json)
    return
  }
  var m = new Migrator(json, fileName, json.file.version, app.getVersion())
  if (m.areSameVersion() || m.noMigrations()) {
    callback(null, false, json)
  } else {
    // not the same version, start migration process
    if (m.plottrBehindFile()) {
      dialog.showErrorBox(i18n('Update Plottr'), i18n("It looks like your file was saved with a newer version of Plottr than you're using now. That could cause problems. Try updating Plottr and starting it again."))
      callback(i18n('Update Plottr'), false, json)
    } else {
      // ask user to try to migrate
      dialog.showMessageBox(win, {type: 'question', buttons: [i18n('yes, update the file'), i18n('no, open the file as-is')], defaultId: 0, message: i18n('It looks like you have an older file version. This could make things work funky or not at all. May Plottr update it for you?'), detail: i18n('It will save a backup first which will be saved to the same folder as this file')}, (choice) => {
        if (choice === 0) {
          m.migrate((err, json) => {
            if (err === 'backup') {
              dialog.showErrorBox(i18n('Problem saving backup'), i18n("Plottr couldn't save a backup. It hasn't touched your file yet, so don't worry. Try quitting Plottr and starting it again."))
              callback('problem saving backup', false, json)
            } else {
              // tell the user that Plottr migrated versions and saved a backup file
              dialog.showMessageBox(win, {type: 'info', buttons: [i18n('ok')], message: i18n("Plottr updated your file without a problem. Don't forget to save your file.")})
              callback(null, true, json)
            }
          })
        } else {
          // open file without migrating
          fs.writeFile(`${fileName}.backup`, JSON.stringify(json, null, 2), (err) => {
            if (err) {
              log.warn(err)
              log.warn('file name: ' + fileName)
              rollbar.warn(err, {fileName: fileName})
              dialog.showErrorBox(i18n('Problem saving backup'), i18n("Plottr tried saving a backup just in case, but it didn't work. Try quitting Plottr and starting it again."))
              callback(err, false, json)
            } else {
              dialog.showMessageBox(win, {type: 'info', buttons: [i18n('ok')], message: i18n("Plottr saved a backup just in case and now on with the show (To use the backup, remove '.backup' from the file name)")})
              callback(null, false, json)
            }
          })
        }
      })
    }
  }
}

////////////////////////////////
///////   BUILD MENU  //////////
////////////////////////////////

function loadMenu (makeItSimple) {
  var template = buildMenu(makeItSimple)
  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (process.platform === 'darwin') {
    let dockMenu = Menu.buildFromTemplate([
      {label: i18n('Create a new file'), click: function () {
        askToCreateFile()
      }},
    ])
    app.dock.setMenu(dockMenu)
  }
}

function buildMenu (makeItSimple) {
  if (makeItSimple) {
    return [
      buildPlottrMenu(),
      buildEditMenu(),
      buildWindowMenu(),
      buildHelpMenu()
    ]
  }

  return [
    buildPlottrMenu(),
    buildFileMenu(),
    buildEditMenu(),
    buildViewMenu(),
    buildWindowMenu(),
    buildHelpMenu()
  ]
}

function buildPlottrMenu () {
  var submenu = [{
    label: i18n('About Plottr'),
    click: openAboutWindow,
  }, {
    label: i18n('Check for updates'),
    click: checkForUpdates
  }]
  if (TRIALMODE) {
    submenu = [].concat(submenu, {
      type: 'separator',
    }, {
      label: i18n('View the Tour'),
      click: () => {
        SETTINGS.set('showTheTour', true)
        reloadWindow()
      }
    }, {
      label: i18n('{days} days remaining', {days: DAYS_LEFT}),
      enabled: false,
    }, {
      label: i18n('Buy the Full Version') + '...',
      click: openBuyWindow,
    }, {
      label: i18n('Enter License') + '...',
      click: openVerifyWindow,
    }, {
      type: 'separator',
    })
  }
  if (!TRIALMODE) {
    submenu = [].concat(submenu, {
      label: i18n('View License Key'),
      click: () => {
        const licenseKey = USER_INFO.purchase ? USER_INFO.purchase.license_key : USER_INFO.license_key
        if (licenseKey) {
          dialog.showMessageBox({type: 'info', title: i18n('Here is your license key'), message: licenseKey})
        } else {
          dialog.showErrorBox(i18n('Error'), i18n('Could not display license key. Try again'))
        }
      }
    })
  }
  if (process.platform === 'darwin') {
    submenu = [].concat(submenu, {
      type: 'separator'
    }, {
      label: i18n('Hide Plottr'),
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: i18n('Hide Others'),
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: i18n('Show All'),
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: i18n('Quit'),
      accelerator: 'Cmd+Q',
      click: function () {
        tryingToQuit = true
        app.quit()
      }
    })
  } else {
    submenu = [].concat(submenu, {
      label: i18n('Close'),
      accelerator: 'Alt+F4',
      click: function () {
        tryingToQuit = true
        app.quit()
      }
    })
  }
  return {
    label: 'Plottr',
    submenu: submenu
  }
}

function buildFileMenu () {
  var submenu = [{
    label: i18n('Close'),
    accelerator: 'CmdOrCtrl+W',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      if (win) {
        let winObj = _.find(windows, {id: win.id})
        if (winObj) {
          if (process.env.NODE_ENV !== 'dev') {
            if (isDirty(winObj.state, winObj.lastSave)) {
              askToSave(win, winObj.state, winObj.fileName, function () { closeWindow(win.id) })
            } else {
              closeWindow(win.id)
            }
          } else {
            closeWindow(win.id)
          }
        } else {
          win.close()
        }
      }
    }
  }]
  var submenu = [].concat({
    label: i18n('New') + '...',
    accelerator: 'CmdOrCtrl+N',
    click: askToCreateFile
  }, {
    label: i18n('Open') + '...',
    accelerator: 'CmdOrCtrl+O',
    click: askToOpenFile
  }, {
    role: "recentDocuments",
    submenu: []
  }, {
    type: 'separator'
  }, {
    label: i18n('Save'),
    accelerator: 'CmdOrCtrl+S',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (winObj) {
        saveFile(winObj.state.file.fileName, winObj.state, function (err) {
          if (err) {
            log.warn(err)
            log.warn('file name: ' + winObj.state.file.fileName)
            rollbar.warn(err, {fileName: winObj.state.file.fileName})
            gracefullyNotSave()
          } else {
            win.webContents.send('state-saved')
            winObj.lastSave = winObj.state
            win.setDocumentEdited(false)
          }
        })
      }
    }
  }, {
    label: i18n('Save as') + '...',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (winObj) {
        dialog.showSaveDialog(win, {title: i18n('Where would you like to save this copy?')}, function (fileName) {
          if (fileName) {
            var fullName = fileName + '.pltr'
            const newState = {
              ...winObj.state,
              storyName: winObj.state.storyName + ' copy'
            }
            saveFile(fullName, newState, function (err) {
              if (err) {
                log.warn(err)
                log.warn('file name: ' + fullName)
                rollbar.warn(err, {fileName: fullName})
                gracefullyNotSave()
              } else {
                openWindow(fullName)
                win.close()
              }
            })
          }
        })
      }
    }
  }, {
    type: 'separator'
  }, {
    label: i18n('Export') + '...',
    click: () => {
      let win = BrowserWindow.getFocusedWindow()
      var winObj = _.find(windows, {id: win.id})
      let exportState = {}
      if (winObj) {
        exportState = winObj.state
      } else {
        exportState = windows[0].state
      }
      dialog.showSaveDialog(win, {title: i18n('Where would you like to save the export?')}, (fileName) => {
        if (fileName) {
          Exporter(exportState, {fileName})
        }
      })
    }
  }, {
    type: 'separator'
  },
  submenu)
  return {
    label: i18n('File'),
    submenu: submenu
  }
}

function buildEditMenu () {
  return {
    label: i18n('Edit'),
    submenu: [{
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: i18n('Copy'),
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: i18n('Paste'),
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      type: 'separator'
    }, {
      label: i18n('Select All'),
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }
}

function buildViewMenu () {
  var submenu = [{
    label: i18n('Reload'),
    accelerator: 'CmdOrCtrl+R',
    click: reloadWindow
  }, {
      label: i18n('Dark Mode'),
      accelerator: 'CmdOrCtrl+D',
      checked: darkMode,
      type: 'checkbox',
      click: function () {
        darkMode = !darkMode
        windows.forEach(function (w) {
          w.window.webContents.send('set-dark-mode', darkMode)
        })
      }
  }, {
    label: i18n('Take Screenshot') + '...',
    accelerator: 'CmdOrCtrl+P',
    click: takeScreenshot
  }]
  if (process.env.NODE_ENV === 'dev') {
    submenu = [].concat(submenu, {
      type: 'separator'
    }, {
      label: 'View Verify Window',
      click: openVerifyWindow
    }, {
      label: 'View Expired Window',
      click: openExpiredWindow
    })
  }
  return {
    label: i18n('View'),
    submenu: submenu
  }
}

function buildWindowMenu () {
  return {
    label: i18n('Window'),
    role: 'window',
    submenu: [
      {
        label: i18n('Minimize'),
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }, {
        type: 'separator'
      }, {
        label: i18n('Bring All to Front'),
        role: 'front'
      }
    ]
  }
}

function buildHelpMenu () {
  return {
    label: i18n('Help'),
    role: 'help',
    submenu: [
      {
        label: i18n('View the Tour'),
        click: () => {
          SETTINGS.set('showTheTour', true)
          reloadWindow()
        }
      }, {
        type: 'separator'
      }, {
        label: i18n('Report a problem') + '...',
        click: function () {
          shell.openExternal('http://plottr.freshdesk.com/support/tickets/new')
        }
      }, {
        label: i18n('Create an error report'),
        sublabel: i18n('Creates a report to send me'),
        click: function () {
          createErrorReport(USER_INFO, windows.map(w => w.state))
        }
      }, {
        label: i18n('Enter a customer service code') + '...',
        click: enterCustomerServiceCode
      }, {
        type: 'separator'
      }, {
        label: i18n('Give feedback') + '...',
        click: function () {
          shell.openExternal('http://plottr.freshdesk.com/support/tickets/new')
        }
      }, {
        label: i18n('Request a feature') + '...',
        click: function () {
          shell.openExternal('http://plottr.freshdesk.com/support/tickets/new')
        }
      }, {
        type: 'separator'
      }, {
        label: i18n('FAQ') + '...',
        click: function () {
          shell.openExternal('http://plottr.freshdesk.com/support/solutions')
        }
      },
    ]
  }
}

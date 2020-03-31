const { app, BrowserWindow, Menu, ipcMain, dialog,
  nativeTheme, globalShortcut, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const deep = require('deep-diff')
const _ = require('lodash')
const storage = require('electron-json-storage')
const log = require('electron-log')
const i18n = require('format-message')
const { is } = require('electron-util')
const windowStateKeeper = require('electron-window-state')
const { autoUpdater } = require('electron-updater')
const migrateIfNeeded = require('./main_modules/migration_manager')
const Exporter = require('./main_modules/exporter')
const { USER_INFO_PATH } = require('./main_modules/config_paths')
const enterCustomerServiceCode = require('./main_modules/customer_service_codes')
const { checkTrialInfo, turnOffTrialMode, startTheTrial, extendTheTrial } = require('./main_modules/trial_manager')
const backupFile = require('./main_modules/backup')
const createErrorReport = require('./main_modules/error_report')
const setupRollbar = require('./main_modules/rollbar')
const SETTINGS = require('./main_modules/settings')
const checkForActiveLicense = require('./main_modules/license_checker')
const TemplateManager = require('./main_modules/template_manager')
const FileManager = require('./main_modules/file_manager')
const emptyFile = require('./main_modules/empty_file')
if (process.env.NODE_ENV === 'dev') {
  // https://github.com/MarshallOfSound/electron-devtools-installer
  // const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log('An error occurred: ', err))

  // require('electron-reload')(path.join('..'))
}

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})
const rollbar = setupRollbar('main')

let TRIALMODE = process.env.TRIALMODE === 'true'
let DAYS_LEFT = null
var USER_INFO = {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windows = []
var aboutWindow = null
var verifyWindow = null
var expiredWindow = null
var dashboardWindow = null

var fileToOpen = null
var dontquit = false
var tryingToQuit = false
var darkMode = nativeTheme.shouldUseDarkColors || false

const filePrefix = is.macos ? 'file://' + __dirname : __dirname

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

nativeTheme.on('updated', () => {
  darkMode = nativeTheme.shouldUseDarkColors
  windows.forEach(w => {
    w.window.webContents.send('set-dark-mode', darkMode)
  })
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
  win.window.setTitle(displayFileName(win.fileName))
  win.window.setRepresentedFilename(win.fileName)

  migrateIfNeeded (win.state, win.fileName, (err, migrated, json) => {
    if (err) { log.warn(err); rollbar.warn(err) }
    if (migrated) saveFile(win.fileName, json, () => {})

    win.lastSave = json
    win.state = json
    win.window.setProgressBar(-1)
    if (win.window.isVisible()) {
      event.sender.send('state-fetched', json, win.fileName, migrated, darkMode, windows.length)
    } else {
      win.window.on('show', () => {
        event.sender.send('state-fetched', json, win.fileName, migrated, darkMode, windows.length)
      })
    }
  })
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

ipcMain.on('chose-template', (event, template) => {
  const empty = emptyFileContents()
  const data = Object.assign({}, empty, template.templateData)
  askToCreateFile(data)
})

app.on('ready', () => {
  i18n.setup({
    translations: require('../locales'),
    locale: app.getLocale() || 'en'
  })

  if (is.macos) {
    loadMenu(true)
  }

  // Register the toggleDevTools shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  checkLicense(() => {
    TemplateManager.load()
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

function saveFile (fileName, jsonData, callback) {
  var stringData = JSON.stringify(jsonData, null, 2)
  fs.writeFile(fileName, stringData, callback)
}

function displayFileName (path) {
  var stringBase = 'Plottr'
  if (process.env.NODE_ENV == 'dev') stringBase += ' (DEV)'
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
    let openFiles = FileManager.listOpenFiles()
    if (openFiles.length) {
      openFiles.forEach(f => openWindow(f))
    } else {
      askToOpenOrCreate()
    }
  }
}

function askToSave (win, state, fileName, callback) {
  const choice = dialog.showMessageBoxSync(win, {type: 'question', buttons: [i18n('yes, save!'), i18n('no, just exit')], defaultId: 0, message: i18n('Would you like to save before exiting?')})
  if (choice == 0) {
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
}

function askToCreateFile (data = {}) {
  const fileName = dialog.showSaveDialogSync({title: i18n('Where would you like to start your new file?')})
  if (fileName) {
    var fullName = fileName + '.pltr'
    if (!Object.keys(data).length) {
      // no data
      data = emptyFileContents()
    }
    saveFile(fullName, data, function (err) {
      if (err) {
        log.warn(err)
        rollbar.warn(err, {fileName: fullName})
        dialog.showErrorBox(i18n('Saving failed'), i18n("Creating your file didn't work. Let's try again."))
        askToCreateFile(data)
      } else {
        openWindow(fullName, data)
      }
    })
  }
}

function askToOpenOrCreate () {
  dontquit = true
  const choice = dialog.showMessageBoxSync({type: 'question', buttons: ['open', 'new'], message: i18n('Would you like to open an existing file or start a new file?')})
  if (choice == 0) {
    askToOpenFile()
  } else {
    askToCreateFile()
  }
}

function askToOpenFile () {
  const properties = [ 'openFile', 'createDirectory' ]
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const files = dialog.showOpenDialogSync({filters: filters, properties: properties })
  if (files && files.length) {
    openWindow(files[0])
  }
}

function openWindow (fileName, jsonData) {
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
  stateKeeper.manage(newWindow)

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

    if (win && !tryingToQuit) {
      FileManager.close(win.fileName)
    }

    if (win && win.state && isDirty(win.state, win.lastSave)) {
      e.preventDefault()
      var _this = this
      askToSave(this, win.state, win.fileName, function() {
        dereferenceWindow(win)
        if (tryingToQuit) app.quit()
        _this.destroy()
      })
    } else {
      dereferenceWindow(win)
    }
  })

  newWindow.setProgressBar(0.4)

  try {
    var json = jsonData ? jsonData : JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    newWindow.setProgressBar(0.5)
    app.addRecentDocument(fileName)
    FileManager.open(fileName)

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
    rollbar.warn(err, {fileName: fileName})
    askToOpenOrCreate()
    FileManager.close(fileName)
    newWindow.destroy()
  } finally {
    checkForUpdates()
  }
}

function dereferenceWindow (winObj) {
  windows = _.reject(windows, function (win) {
    return win.id === winObj.id
  })
}

function closeWindow (id) {
  let win = _.find(windows, {id: id})
  let windowFile = win.fileName
  win.window.close()
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
    const data = emptyFileContents(i18n('Plottr Trial'))
    saveFile(fileName, data, function(err) {
      if (err) {
        log.warn(err)
        rollbar.warn(err)
      } else {
        openWindow(fileName, data)
      }
    })
  }
}

function emptyFileContents (name) {
  return emptyFile(name)
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

function openDashboardWindow () {
  dontquit = true
  const dashboardFile = path.join(filePrefix, 'dashboard.html')
  dashboardWindow = new BrowserWindow({frame: false, height: 525, width: 800, show: false, webPreferences: {nodeIntegration: true}})
  dashboardWindow.loadURL(dashboardFile)
  if (SETTINGS.get('forceDevTools')) {
    dashboardWindow.openDevTools()
  }
  dashboardWindow.once('ready-to-show', function() {
    this.show()
  })
  dashboardWindow.on('close', function () {
    dashboardWindow = null
  })
}

function openBuyWindow () {
  shell.openExternal("https://gum.co/fgSJ")
}

function gracefullyQuit () {
  dialog.showMessageBoxSync({type: 'info', buttons: [i18n('ok')], message: i18n('Plottr ran into a problem. Try opening Plottr again.'), detail: i18n('If you keep seeing this problem, email me at family@plottrapp.com')})
  app.quit()
}

function gracefullyNotSave () {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

function takeScreenshot () {
  let win = BrowserWindow.getFocusedWindow()
  if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
  win.capturePage().then(image => {
    if (process.env.NODE_ENV === 'dev') {
      const folderPath = path.join(app.getPath('home'), 'plottr_screenshots', app.getVersion())
      const date = new Date()
      const fileName = `screenshot-${date.getMinutes()}-${date.getSeconds()}.png`
      const filePath = path.join(folderPath, fileName)
      fs.stat(folderPath, (err, stat) => {
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
      const fileName = dialog.showSaveDialogSync(win)
      if (fileName) fs.writeFile(fileName + '.png', image.toPNG(), () => {})
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
///////   BUILD MENU  //////////
////////////////////////////////

function loadMenu (makeItSimple) {
  var template = buildMenu(makeItSimple)
  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (is.macos) {
    let dockMenu = Menu.buildFromTemplate([
      {label: i18n('Create a new file'), click: function () {
        askToCreateFile()
      }},
      {label: i18n('Create an error report'), click: () => {
        createErrorReport(USER_INFO, windows.map(w => w.state))
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
          dialog.showMessageBoxSync({type: 'info', title: i18n('Here is your license key'), message: licenseKey})
        } else {
          dialog.showErrorBox(i18n('Error'), i18n('Could not display license key. Try again'))
        }
      }
    })
  }
  if (is.macos) {
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
  let submenu = [].concat({
    label: i18n('New') + '...',
    accelerator: 'CmdOrCtrl+N',
    click: () => { askToCreateFile() },
  })
  if (SETTINGS.get('premiumFeatures')) {
    submenu = [].concat(submenu, {
      label: i18n('New from Template') + '...',
      click: openDashboardWindow
    })
  }
  submenu = [].concat(submenu, {
    label: i18n('Open') + '...',
    accelerator: 'CmdOrCtrl+O',
    click: askToOpenFile
  }, {
    role: "recentDocuments",
    submenu: [],
    visible: is.macos,
  }, {
    type: 'separator',
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
        const fileName = dialog.showSaveDialogSync(win, {title: i18n('Where would you like to save this copy?')})
        if (fileName) {
          var fullName = fileName + '.pltr'
          let newState = {...winObj.state}
          if (SETTINGS.get('premiumFeatures')) {
            newState.series.name = `${newState.series.name} copy`
          } else {
            newState.books[1].title = `${newState.books[1].title} copy`
          }
          saveFile(fullName, newState, function (err) {
            if (err) {
              log.warn(err)
              rollbar.warn(err, {fileName: fullName})
              gracefullyNotSave()
            } else {
              openWindow(fullName, newState)
              win.close()
            }
          })
        }
      }
    }
  }, {
    label: i18n('Close'),
    accelerator: 'CmdOrCtrl+W',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      if (win) {
        let winObj = _.find(windows, {id: win.id})
        if (winObj) {
          if (process.env.NODE_ENV == 'dev') return closeWindow(win.id)

          if (isDirty(winObj.state, winObj.lastSave)) {
            askToSave(win, winObj.state, winObj.fileName, function () { closeWindow(win.id) })
          } else {
            closeWindow(win.id)
          }
        } else {
          win.close()
        }
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
      const fileName = dialog.showSaveDialogSync(win, {title: i18n('Where would you like to save the export?')})
      if (fileName) {
        Exporter(exportState, {fileName})
      }
    }
  })
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
        windows.forEach(w => {
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

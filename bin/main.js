const { app, BrowserWindow, Menu, ipcMain, dialog,
  nativeTheme, globalShortcut, shell, screen } = require('electron')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const log = require('electron-log')
const i18n = require('format-message')
const { is } = require('electron-util')
const { machineIdSync } = require('node-machine-id')
const windowStateKeeper = require('electron-window-state')
const { autoUpdater } = require('electron-updater')
const migrateIfNeeded = require('./main_modules/migration_manager')
const Exporter = require('./main_modules/exporter')
const enterCustomerServiceCode = require('./main_modules/customer_service_codes')
const { checkTrialInfo, turnOffTrialMode, startTheTrial, extendTheTrial } = require('./main_modules/trial_manager')
const backupFile = require('./main_modules/backup')
const createErrorReport = require('./main_modules/error_report')
const setupRollbar = require('./main_modules/rollbar')
const SETTINGS = require('./main_modules/settings')
const { checkForActiveLicense, getLicenseInfo } = require('./main_modules/license_checker')
const TemplateManager = require('./main_modules/template_manager')
const CustomTemplateManager = require('./main_modules/custom_template_manager')
const FileManager = require('./main_modules/file_manager')
const { isDirty, takeScreenshot, emptyFileContents } = require('./main_modules/helpers')
if (process.env.NODE_ENV === 'dev') {
  // https://github.com/MarshallOfSound/electron-devtools-installer
  // issue: https://github.com/electron/electron/issues/22117
  // const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
  // app.whenReady().then(() => {
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //       .then((name) => console.log(`Added Extension:  ${name}`))
  //       .catch((err) => console.log('An error occurred: ', err))
  // })

  // require('electron-reload')(path.join('..'))
}

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})
const rollbar = setupRollbar('main')

let TRIALMODE = process.env.TRIALMODE === 'true'
let DAYS_LEFT = null
var USER_INFO = getLicenseInfo()

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

// mixpanel tracking
var launchSent = false

// auto updates
let checkedForActiveLicense = false
let lastCheckedForUpdate = new Date().getTime()
const updateCheckThreshold = 1000 * 60 * 60
log.transports.file.level = 'info'
autoUpdater.logger = log

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
TemplateManager.load()
checkUpdatesIfAllowed()


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
  if (is.windows) {
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

app.on('open-url', function (event, url) {
  event.preventDefault()
  // handle custom protocol links here for mac
  // make sure to check that the app is ready
  log.info("open-url event: " + url)
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!windows.length) {
    checkLicense(() => {})
  }
})

app.on('browser-window-focus', () => {
  const currentTime = new Date().getTime()
  if (currentTime - lastCheckedForUpdate > updateCheckThreshold) {
    lastCheckedForUpdate = currentTime
    checkUpdatesIfAllowed()
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
    FileManager.save(winObj.fileName, state, (err) => {
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
  win.window.setTitle(displayFileName(win.fileName))
  win.window.setRepresentedFilename(win.fileName)

  migrateIfNeeded (win.state, win.fileName, (err, migrated, json) => {
    if (err) { log.warn(err); rollbar.warn(err) }
    if (migrated) FileManager.save(win.fileName, json, () => {})

    win.lastSave = json
    win.state = json
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
    FileManager.save(winObj.fileName, state, function(err, data) {
      if (err) { log.warn(err); rollbar.warn(err) }
      winObj.state = state
      winObj.window.webContents.reload()
    })
  }
})

ipcMain.on('launch-sent', (event) => {
  launchSent = true
})

ipcMain.on('open-buy-window', (event) => {
  if (expiredWindow) expiredWindow.close()
  openBuyWindow()
})

ipcMain.on('verify-from-expired', () => {
  if (expiredWindow) expiredWindow.close()
  openVerifyWindow()
})

function licenseVerified (ask) {
  if (verifyWindow) verifyWindow.close()
  if (TRIALMODE) {
    TRIALMODE = false
    SETTINGS.set('trialMode', false)
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
    SETTINGS.set('trialMode', true)
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
      if (windows.length) {
        windows.forEach(winObj => {
          winObj.window.setTitle(displayFileName(winObj.fileName))
        })
      } else {
        openRecentFiles()
      }
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

  loadMenu(true)

  // Register the toggleDevTools shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  if (process.env.NODE_ENV != 'dev') {
    app.setAsDefaultProtocolClient('plottr')
  }

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

function checkUpdatesIfAllowed () {
  if (process.env.NODE_ENV == 'dev') return
  if (TRIALMODE) return
  if (checkedForActiveLicense && !SETTINGS.get('premiumFeatures')) return

  autoUpdater.allowPrerelease = SETTINGS.get('allowPrerelease')

  if (!checkedForActiveLicense) {
    checkForActiveLicense(USER_INFO, valid => {
      checkedForActiveLicense = true
      if (valid) {
        checkForUpdates()
      }
    })
  } else if (SETTINGS.get('premiumFeatures')) {
    checkForUpdates()
  }
}

function checkForUpdates () {
  autoUpdater.checkForUpdatesAndNotify()
}

function checkLicense (callback) {
  if (Object.keys(USER_INFO).length) {
    if (TRIALMODE) {
      // still in trial mode
      if (USER_INFO.success) {
        TRIALMODE = false
        SETTINGS.set('trialMode', false)
        turnOffTrialMode()
      }
      callback()
      openRecentFiles()
    } else {
      // not-trial, normal mode
      callback()
      if (USER_INFO.success) openRecentFiles()
      else openVerifyWindow()
    }
  } else {
    // no license yet, check for trial info
    checkTrialInfo(daysLeft => {
      TRIALMODE = true
      SETTINGS.set('trialMode', true)
      DAYS_LEFT = daysLeft
      callback()
      openRecentFiles()
    }, openVerifyWindow, openExpiredWindow)
  }
}

function displayFileName (path) {
  var stringBase = 'Plottr'
  if (TRIALMODE) stringBase += ' — ' + i18n('TRIAL Version') + ' (' + i18n('{days} days remaining', {days: DAYS_LEFT}) + ')'
  var matches = path.match(/.*\/(.*\.pltr)/)
  if (matches) stringBase += ` — ${matches[1]}`
  if (process.env.NODE_ENV == 'dev') stringBase += ' - (DEV)'
  return stringBase
}

function openRecentFiles () {
  // open-file for windows
  if (is.windows && process.argv.length == 2) {
    const param = process.argv[1]

    if (param.includes('.pltr')) {
      openWindow(param)
    }

    // handle custom protocol links here for windows
    // const link = param.replace('plottr://')
  } else if (fileToOpen) {
    openWindow(fileToOpen)
    fileToOpen = null
  } else {
    let openFiles = FileManager.listOpenFiles()
    if (openFiles.length) {
      openFiles.forEach(f => openWindow(f))
    } else {
      // TODO: open a dashboard here instead (or maybe it always gets opened, so no need for this branch of logic)
      askToOpenOrCreate()
    }
  }
}

function askToSave (win, state, fileName, callback) {
  const choice = dialog.showMessageBoxSync(win, {type: 'question', buttons: [i18n('yes, save!'), i18n('no, just exit')], defaultId: 0, message: i18n('Would you like to save before exiting?')})
  if (choice == 0) {
    FileManager.save(fileName, state, function (err) {
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
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const fileName = dialog.showSaveDialogSync({filters: filters, title: i18n('Where would you like to start your new file?')})
  if (fileName) {
    const fullName = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
    const storyName = path.basename(fileName, '.pltr')
    if (!Object.keys(data).length) {
      // no data
      data = emptyFileContents(storyName)
    } else {
      data.series.name = storyName
      data.books[1].title = storyName
    }
    FileManager.save(fullName, data, (err) => {
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
  const choice = dialog.showMessageBoxSync({type: 'question', buttons: [i18n('New from Template'), i18n('New File'), i18n('Open File')], message: i18n('Would you like to open an existing file or start a new file?')})
  switch (choice) {
    case 0:
      openDashboardWindow()
      break
    case 1:
      askToCreateFile()
      break
    case 2:
      askToOpenFile()
      break
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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * 0.9),
    defaultHeight: parseInt(height * 0.9),
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


  // and load the app.html of the app.
  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)


  newWindow.once('ready-to-show', function() {
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

  newWindow.webContents.on('unresponsive', () => {
    log.warn('webContents became unresponsive')
    newWindow.webContents.reload()
  })

  newWindow.on('unresponsive', () => {
    log.warn('window became unresponsive')
    newWindow.webContents.reload()
  })

  if (process.env.NODE_ENV === 'dev' || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    var win = _.find(windows, {id: this.id})

    // closing the window, but not trying to quit
    // only remove from open windows if there's more than one window open
    if (!tryingToQuit && windows.length > 1 && win) {
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


  try {
    let json = jsonData ? jsonData : JSON.parse(fs.readFileSync(fileName, 'utf-8'))
    app.addRecentDocument(fileName)
    FileManager.open(fileName)

    windows.push({
      id: newWindow.id,
      window: newWindow,
      fileName: fileName,
      state: json,
      lastSave: json
    })
    newWindow.setTitle(displayFileName(fileName))
    newWindow.setRepresentedFilename(fileName)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: fileName})
    FileManager.close(fileName)
    newWindow.destroy()
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
    FileManager.save(fileName, data, function(err) {
      if (err) {
        log.warn(err)
        rollbar.warn(err)
      } else {
        openWindow(fileName, data)
      }
    })
  }
}

function openAboutWindow () {
  if (aboutWindow) {
    aboutWindow.focus()
    return
  }

  const aboutFile = path.join(filePrefix, 'about.html')
  aboutWindow = new BrowserWindow({width: 350, height: 566, show: false, webPreferences: {nodeIntegration: true}})
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
  expiredWindow = new BrowserWindow({height: 600, width: 700, show: false, webPreferences: {nodeIntegration: true}})
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
  shell.openExternal("https://getplottr.com/pricing/")
}

function gracefullyQuit () {
  dialog.showMessageBoxSync({type: 'info', buttons: [i18n('ok')], message: i18n('Plottr ran into a problem. Try opening Plottr again.'), detail: i18n('If you keep seeing this problem, email us at support@getplottr.com')})
  app.quit()
}

function gracefullyNotSave () {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
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
    click: checkUpdatesIfAllowed,
    visible: SETTINGS.get('premiumFeatures'),
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
  submenu = [].concat(submenu, {
    label: i18n('View License Key'),
    visible: !TRIALMODE,
    click: () => {
      const licenseKey = USER_INFO.licenseKey
      if (licenseKey) {
        const title = i18n('License Key')
        const text = i18n('Here is your license key')
        dialog.showMessageBoxSync({type: 'info', title: title, message: text, detail: licenseKey})
      } else {
        dialog.showErrorBox(i18n('Error'), i18n('Could not display license key. Try again'))
      }
    }
  }, {
    label: i18n('View Device ID'),
    visible: !TRIALMODE,
    click: () => {
      const id = machineIdSync(true)
      const title = i18n('Device ID')
      const text = i18n('This is your Device ID')
      dialog.showMessageBoxSync({type: 'info', title: title, message: text, detail: id})
    }
  })
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
  let submenu = [{
    label: i18n('New') + '...',
    accelerator: 'CmdOrCtrl+N',
    click: () => askToCreateFile({}), // don't change this to just a function name … it causes a bug. You've been bitten by it a couple times
  }, {
    label: i18n('New from Template') + '...',
    click: openDashboardWindow,
  }, {
    label: i18n('Open') + '...',
    accelerator: 'CmdOrCtrl+O',
    click: askToOpenFile,
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
        FileManager.save(winObj.state.file.fileName, winObj.state, function (err) {
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
          let fullName = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
          let newState = {...winObj.state}
          newState.series.name = `${newState.series.name} copy`
          FileManager.save(fullName, newState, (err) => {
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
    label: i18n('Save as Template'),
    click: () => {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = windows.find(w => w.id == win.id)
      if (winObj) {
        CustomTemplateManager.addNew(winObj.state)
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
      const win = BrowserWindow.getFocusedWindow()
      const winObj = _.find(windows, {id: win.id})
      let exportState = {}
      if (winObj) {
        exportState = winObj.state
      } else {
        exportState = windows[0].state
      }
      const fileName = dialog.showSaveDialogSync(win, {title: i18n('Where would you like to save the export?')})
      if (fileName) {
        Exporter(exportState, {fileName, bookId: exportState.ui.currentTimeline})
      }
    }
  }, {
    type: 'separator',
    visible: process.env.NODE_ENV === 'dev',
  }, {
    label: i18n('Reload from File'),
    visible: process.env.NODE_ENV === 'dev',
    click: () => {
      const win = BrowserWindow.getFocusedWindow()
      const winObj = _.find(windows, {id: win.id})
      if (winObj) {
        try {
          const json = JSON.parse(fs.readFileSync(winObj.fileName, 'utf-8'))
          winObj.state = json
          winObj.lastSave = json
          win.webContents.send('state-fetched', json, winObj.fileName, true, darkMode, windows.length)
        } catch (error) {
          log.info(error)
        }
      }
    }
  }]
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
  }, {
    type: 'separator',
    visible: process.env.NODE_ENV === 'dev',
  }, {
    label: 'View Verify Window',
    click: openVerifyWindow,
    visible: process.env.NODE_ENV === 'dev',
  }, {
    label: 'View Expired Window',
    click: openExpiredWindow,
    visible: process.env.NODE_ENV === 'dev',
  }]

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
        visible: false,
        click: () => {
          SETTINGS.set('showTheTour', true)
          reloadWindow()
        }
      }, {
        label: i18n('Documentation'),
        click: () => shell.openExternal('https://getplottr.com/docs/navigating-plottr/')
      }, {
        label: i18n('Facebook Support Group'),
        click: () => shell.openExternal('https://www.facebook.com/groups/367650870614184')
      }, {
        type: 'separator'
      }, {
        label: i18n('Report a Problem'),
        click: () => shell.openExternal('https://getplottr.com/support/')
      }, {
        label: i18n('Create an Error Report'),
        sublabel: i18n('Creates a report to send me'),
        click: () => createErrorReport(USER_INFO, windows.map(w => w.state))
      }, {
        label: i18n('Enter a Customer Service Code'),
        click: enterCustomerServiceCode
      }, {
        type: 'separator'
      }, {
        label: i18n('Give Feedback'),
        click: () => shell.openExternal('https://feedback.getplottr.com')
      }, {
        label: i18n('Request a Feature'),
        click: () => shell.openExternal('https://getplottr.com/support/?help=Feature%20Request')
      }, {
        type: 'separator'
      }, {
        label: i18n('FAQ'),
        click: () => shell.openExternal('https://getplottr.com/docs/frequently-asked-questions/')
      }, {
        label: i18n('Roadmap'),
        click: () => shell.openExternal('https://roadmap.getplottr.com')
      }
    ]
  }
}

const { app, BrowserWindow, Menu, ipcMain, dialog,
  systemPreferences, globalShortcut, shell } = require('electron')
var Migrator = require('./migrator/migrator')
var Exporter = require('./exporter')
var fs = require('fs')
var path = require('path')
var deep = require('deep-diff')
var _ = require('lodash')
var storage = require('electron-json-storage')
var log = require('electron-log')
var Rollbar = require('rollbar')
var request = require('request')
var { stringify } = require('dotenv-stringify')
var i18n = require('format-message')
const { autoUpdater } = require('electron-updater')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})

var TRIALMODE = process.env.TRIALMODE === 'true'
const TRIAL_LENGTH = 30
const FIRST_DAY_PATH = 'first_day'
var DAYS_LEFT = TRIAL_LENGTH
let DAY_OF_TRIAL = TRIAL_LENGTH

const USER_INFO_PATH = 'user_info'
var USER_INFO = {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windows = []
var aboutWindow = null
var verifyWindow = null
var reportWindow = null
var buyWindow = null
var expiredWindow = null

var fileToOpen = null
var dontquit = false
var tryingToQuit = false
var darkMode = systemPreferences.isDarkMode() || false

const filePrefix = process.platform === 'darwin' ? 'file://' + __dirname : __dirname
const recentKey = process.env.NODE_ENV === 'dev' ? 'recentFilesDev' : 'recentFiles'

// mixpanel tracking
var launchSent = false

////////////////////////////////
////     Bug Reporting    //////
////////////////////////////////

let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
  handleUnhandledRejections: true,
  ignoredMessages: [],
  payload: {
    environment: environment,
    version: app.getVersion(),
    where: 'main',
    os: process.platform
  }
})
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
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    if (!dontquit) app.quit()
  }
})

app.on('open-file', function (event, path) {
  // do the file opening here
  if (app.isReady()) {
    openWindow(path)
  } else {
    fileToOpen = path
  }
  event.preventDefault()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.length === 0) {
    checkLicense(function() {})
  }
})

// Listen for web contents being created
app.on('web-contents-created', (e, contents) => {
  // Check for a webview
  if (contents.getType() == 'window') {
    // Listen for any new window events
    contents.on('new-window', (e, url) => {
      e.preventDefault()
      if (url.includes("paypal.com")) {
        shell.openExternal("https://gum.co/fgSJ")
      }
    })
  }
})

ipcMain.on('save-state', function (event, state, winId, isNewFile) {
  var winObj = _.find(windows, {id: winId})
  let wasEdited = checkDirty(state, winObj.lastSave)
  winObj.window.setDocumentEdited(wasEdited)
  winObj.window.setTitle(displayFileName(winObj.fileName))
  winObj.window.setRepresentedFilename(winObj.fileName)

  // save the new state
  winObj.state = state
  if (isNewFile || wasEdited) {
    saveFile(winObj.fileName, state, function (err) {
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
  openBuyWindow()
})

ipcMain.on('license-to-verify', function (event, licenseString) {
  dialog.showMessageBox(buyWindow, {type: 'info', buttons: [i18n('ok')], message: i18n('Verifying your license. Please wait...'), detail: licenseString}, function (choice) {})
  var req = {
    url: 'https://api.gumroad.com/v2/licenses/verify',
    method: 'POST',
    json: true,
    body: {
      product_permalink: 'fgSJ',
      license_key: licenseString
    }
  }
  const view = this
  request(req, function (err, response, body) {
    if (err && err.code === 404) {
      logger.warn(err)
      dialog.showErrorBox(i18n('License verification failed'), i18n('Try again by clicking in the menu: Plottr > Verify License...'))
    } else {
      if (body.success && !body.purchase.refunded && !body.purchase.chargebacked && body.uses <= 5) {
        // save uses, purchase.email, purchase.full_name, purchase.variants
        storage.set('user_info', body, function(err) {
          if (err) {
            logger.error(err)
            dialog.showErrorBox(i18n('License verification failed'), i18n('Try again by clicking in the menu: Plottr > Verify License...'))
          } else {
            dialog.showMessageBox({type: 'info', buttons: [i18n('ok')], message: i18n("License verified! You're all set."), detail: i18n("Now let's get to the good stuff")}, function () {
              if (windows[0]) windows[0].window.webContents.send('bought-in-app', DAY_OF_TRIAL)
              licenseVerified(false)
            })
          }
        })
      } else {
        rollbar.warn(`Refund or maxed out. Uses: ${body.uses}. Refund: ${body.purchase.refunded}. Chargebacked: ${body.purchase.chargebacked}`)
        logger.warn(`Refund or maxed out. Uses: ${body.uses}. Refund: ${body.purchase.refunded}. Chargebacked: ${body.purchase.chargebacked}`)
        dialog.showErrorBox(i18n('License verification failed'), i18n('It looks like you have Plottr on 5 computers already or you requested a refund'))
      }
    }
  })
})

function licenseVerified (ask) {
  if (verifyWindow) verifyWindow.close()
  if (buyWindow) buyWindow.close()
  if (TRIALMODE) {
    turnOffTrialMode()
    loadMenu()
    if (ask) askToOpenOrCreate()
  } else {
    openRecentFiles()
  }
}

ipcMain.on('license-verified', function () {
  licenseVerified(true)
})

ipcMain.on('export', function (event, options, winId) {
  var winObj = _.find(windows, {id: winId})
  Exporter(winObj.state, options)
})

app.on('ready', function () {
  if (process.env.NODE_ENV === 'license') {
    const fakeData = require('./devLicense')
    storage.set(USER_INFO_PATH, fakeData, function(err) {
      if (err) console.log(err)
      else console.log('dev license created')
      app.quit()
    })
  } else {
    i18n.setup({
      translations: require('../locales'),
      locale: app.getLocale() || 'en'
    })

    // Register the toggleDevTools shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+Alt+R', () => {
      let win = BrowserWindow.getFocusedWindow()
      if (win) win.toggleDevTools()
    })

    checkLicense(function() {
      loadMenu()

      if (process.platform === 'darwin') {
        let dockMenu = Menu.buildFromTemplate([
          {label: i18n('Create a new file'), click: function () {
            askToCreateFile()
          }},
        ])
        app.dock.setMenu(dockMenu)
      }

      If (!TRIALMODE) {
        log.transports.file.level = 'debug'
        autoUpdater.logger = log
        autoUpdater.checkForUpdatesAndNotify()
      }
    })
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

////////////////////////////////
///////   FUNCTIONS   //////////
////////////////////////////////

function checkLicense (callback) {
  storage.has(USER_INFO_PATH, function (err, hasKey) {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(USER_INFO_PATH, function (err, data) {
        if (err) log.error(err)
        USER_INFO = data
        if (TRIALMODE) {
          if (data.success) turnOffTrialMode()
          callback()
          openRecentFiles()
        } else {
          callback()
          if (data.success) openRecentFiles()
          else openVerifyWindow()
        }
      })
    } else {
      callback()
      if (TRIALMODE) checkFirstDay(createEmpty, openRecentFiles)
      else openVerifyWindow()
    }
  })
}

function turnOffTrialMode () {
  if (process.env.NODE_ENV !== 'dev') {
    TRIALMODE = false
    process.env.TRIALMODE = 'false'
  }
  writeToEnv('TRIALMODE', 'false')
}

function writeToEnv (key, val) {
  var env = {
    ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    TRIALMODE: process.env.TRIALMODE,
  }
  env[key] = val
  var envstr = stringify(env)

  fs.writeFileSync(ENV_FILE_PATH, envstr)
}

function dayOfTrial (firstDay) {
  let oneDay = 24*60*60*1000
  var today = new Date()
  DAY_OF_TRIAL = Math.round((today.getTime() - firstDay)/oneDay)
  return DAY_OF_TRIAL
}

function checkFirstDay (isFirstDayCallback, notFirstDayCallback) {
  storage.has(FIRST_DAY_PATH, function (err, hasKey) {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(FIRST_DAY_PATH, function (err, data) {
        if (err) log.error(err)
        let numOfDays = dayOfTrial(data.firstDay)
        if (numOfDays > TRIAL_LENGTH) {
          // disable after 30 days
          openExpiredWindow()
        } else {
          DAYS_LEFT = TRIAL_LENGTH - numOfDays
          notFirstDayCallback()
          loadMenu()
        }
      })
    } else {
      let day = new Date()
      let time = day.getTime()
      storage.set(FIRST_DAY_PATH, {firstDay: time}, function (err) {
        if (err) {
          log.error(err)
          rollbar.warn(err)
        }
        isFirstDayCallback()
      })
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

function checkDirty (state, lastSave) {
  var diff = deep.diff(lastSave, state) || []
  var edited = false
  if (state.file && state.file.dirty && diff.length > 0) edited = true
  return edited
}

function openRecentFiles () {
  // open-file for windows
  if (process.platform === 'win32' && process.argv.length == 2) {
    if (process.argv[1].includes('.pltr') || process.argv[1].includes('.plottr')) {
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
  // Create the browser window.
  let newWindow = new BrowserWindow({width: 1200, height: 800, show: false, backgroundColor: '#f7f7f7', webPreferences: {scrollBounce: true, nodeIntegration: true}})
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
    if (!launchSent) {
      newWindow.webContents.send('send-launch', app.getVersion(), TRIALMODE, DAY_OF_TRIAL)
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    var win = _.find(windows, {id: this.id})
    if (checkDirty(win.state, win.lastSave)) {
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
      json.file.fileName = updateFileExtenstion(json.file.fileName)
    }
    newWindow.setProgressBar(0.5)
    fileName = updateFileExtenstion(fileName)
    storage.set(recentKey, fileName, function (err) {
      if (err) console.log(err)
      app.addRecentDocument(fileName)
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
  }
}

// fix for switching file extension to .pltr
function updateFileExtenstion (fileName) {
  return fileName.replace('.plottr', '.pltr')
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

function openTour () {
  openWindow(__dirname + '/tour/en.pltr')
  // TODO: when the tour is translated, do this
  // let locale = app.getLocale()
  // if (locale.includes('en')) {
  //   openWindow(__dirname + '/tour/en.pltr')
  // } else if (locale.includes('fr')) {
  //   openWindow(__dirname + '/tour/fr.pltr')
  // }
}

function createEmpty () {
  let home = process.platform === 'darwin' ? process.env.HOME : process.env.HOMEPATH
  let fileName = path.join(home, 'Documents', 'plottr_trial.pltr')
  fs.writeFile(fileName, emptyFileContents(), function(err) {
    if (err) {
      log.warn(err)
      rollbar.warn(err)
    } else {
      openWindow(fileName)
    }
  })
}

function emptyFileContents () {
  let data = require('./empty_file.json')
  return JSON.stringify(data, null, 2)
}

function openAboutWindow () {
  const aboutFile = path.join(filePrefix, 'about.html')
  aboutWindow = new BrowserWindow({width: 350, height: 550, show: false})
  aboutWindow.loadURL(aboutFile)
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
  verifyWindow = new BrowserWindow({frame: false, height: 425, show: false})
  verifyWindow.loadURL(verifyFile)
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
  expiredWindow = new BrowserWindow({frame: false, height: 425, width: 700, show: false})
  expiredWindow.loadURL(expiredFile)
  expiredWindow.once('ready-to-show', function() {
    this.show()
  })
  expiredWindow.on('close', function () {
    expiredWindow = null
  })
}

function openReportWindow (page) {
  reportWindow = new BrowserWindow({show: false})
  reportWindow.loadURL(page)
  reportWindow.once('ready-to-show', function() {
    this.show()
  })
  reportWindow.on('close', function () {
    reportWindow = null
  })
}

function openBuyWindow () {
  const buyFile = path.join(filePrefix, 'buy.html')
  buyWindow = new BrowserWindow({height: 600, show: false, backgroundColor: 'white'})
  buyWindow.loadURL(buyFile)
  buyWindow.once('ready-to-show', function() {
    this.show()
  })
  buyWindow.on('close', function () {
    reportWindow = null
  })
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
              fs.writeFile(filePath, image.toPNG())
            }
          })
        } else {
          if (stat.isDirectory()) {
            fs.writeFile(filePath, image.toPNG())
          }
        }
      })
    } else {
      dialog.showSaveDialog(win, function(fileName) {
        if (fileName) fs.writeFile(fileName + '.png', image.toPNG())
      })
    }
  })
}

function prepareErrorReport () {
  var report = 'VERSION: ' + app.getVersion() + '\n\n'
  report += 'USER INFO\n'
  report += JSON.stringify(USER_INFO) + '\n\n'
  report += '----------------------------------\n\n'
  report += 'ERROR LOG\n'
  let logFile = log.transports.file.findLogPath()
  let logContents = null
  try{
    logContents = fs.readFileSync(logFile)
  } catch (e) {
    // no log file, no big deal
  }
  report += logContents + '\n\n'
  report += '----------------------------------\n\n'
  report += 'FILE STATE\n'
  let openFilesState = windows.map(function(w) {
    return JSON.stringify(w.state)
  })
  report += openFilesState.join("\n\n------------\n\n")
  return report
}

function sendErrorReport (body) {
  let home = process.platform === 'darwin' ? process.env.HOME : process.env.HOMEPATH
  var fileName = path.join(home, 'Documents', 'plottr_error_report.txt')
  fs.writeFile(fileName, body, function(err) {
    if (err) {
      log.warn(err)
      rollbar.warn(err)
    } else {
      dialog.showMessageBox({type: 'info', buttons: [i18n('ok')], message: i18n('Upload the file Plottr just exported'), detail: i18n('Please upload the file named plottr_error_report.txt in your Documents folder')})
      openReportWindow('http://plottr.freshdesk.com/support/tickets/new')
    }
  })
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

function loadMenu () {
  var template = buildMenu()
  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function buildMenu () {
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
  }]
  if (TRIALMODE) {
    submenu = [].concat(submenu, {
      type: 'separator',
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
    label: i18n('Open the Tour') + '...',
    click: openTour,
  })
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
            if (checkDirty(winObj.state, winObj.lastSave)) {
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
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+N',
    click: askToCreateFile
  }, {
    label: i18n('Open') + '...',
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+O',
    click: askToOpenFile
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
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+Shift+S',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (winObj) {
        dialog.showSaveDialog(win, {title: i18n('Where would you like to save this copy?')}, function (fileName) {
          if (fileName) {
            var fullName = fileName + '.pltr'
            saveFile(fullName, winObj.state, function (err) {
              if (err) {
                log.warn(err)
                log.warn('file name: ' + fullName)
                rollbar.warn(err, {fileName: fullName})
                gracefullyNotSave()
              } else {
                app.addRecentDocument(fullName)
              }
            })
          }
        })
      }
    }
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
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (process.env.NODE_ENV !== 'dev') {
        if (checkDirty(winObj.state, winObj.lastSave)) {
          askToSave(win, winObj.state, winObj.fileName, win.webContents.reload)
        } else {
          win.webContents.reload()
        }
      } else {
        win.webContents.reload()
      }
    }
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
        label: i18n('Report a Problem') + '...',
        sublabel: i18n('Creates a report to send me'),
        click: function () {
          let report = prepareErrorReport()
          sendErrorReport(report)
        }
      },
      {
        label: i18n('Give feedback') + '...',
        click: function () {
          openReportWindow('http://plottr.freshdesk.com/support/tickets/new')
        }
      },
      {
        label: i18n('Request a feature') + '...',
        click: function () {
          openReportWindow('http://plottr.freshdesk.com/support/tickets/new')
        }
      },
      {
        label: i18n('FAQ') + '...',
        click: function () {
          openReportWindow('http://plottr.freshdesk.com/support/solutions')
        }
      },
    ]
  }
}

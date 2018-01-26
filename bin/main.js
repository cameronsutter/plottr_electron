const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
var Migrator = require('./migrator/migrator')
var Exporter = require('./exporter')
var RecentFilesManager = require('./recentfilesmanager')
var fs = require('fs')
var path = require('path')
var deep = require('deep-diff')
var _ = require('lodash')
var storage = require('electron-json-storage')
var log = require('electron-log')
var Rollbar = require('rollbar')
var request = require('request')
var { stringify } = require('dotenv-stringify')
require('dotenv').config()
var TRIALMODE = process.env.TRIALMODE === 'true'

const USER_INFO_PATH = 'user_info'
var USER_INFO = {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windows = []
var aboutWindow = null
var verifyWindow = null
var reportWindow = null
var buyWindow = null

var fileToOpen = null
var dontquit = false
var recentFilesManager = new RecentFilesManager()
const filePrefix = process.platform === 'darwin' ? 'file://' + __dirname : __dirname
const openRecentFileMenuItemName = 'Open Recent'

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
recentFilesManager.rollbar = rollbar;
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

ipcMain.on('save-state', function (event, state, winId, isNewFile) {
  var winObj = _.find(windows, {id: winId})
  let wasEdited = checkDirty(state, winObj.lastSave)
  winObj.window.setDocumentEdited(wasEdited)
  winObj.window.setTitle(displayFileName(winObj.fileName))
  winObj.window.setRepresentedFilename(winObj.fileName)

  // save the new state
  winObj.state = state
  if (shouldSave(isNewFile, wasEdited)) {
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

function shouldSave(isNewFile, wasEdited) {
  if (isNewFile) return true
  if (wasEdited && !TRIALMODE) return true
  return false
}

ipcMain.on('fetch-state', function (event, id) {
  var win = _.find(windows, {id: id})
  if (win.state.file) {
    win.window.setTitle(displayFileName(win.fileName))
    win.window.setRepresentedFilename(win.fileName)
  }

  if (win.window.isVisible()) {
    migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
      if (err) { log.warn(err); rollbar.warn(err) }
      event.sender.send('state-fetched', json, win.fileName, dirty)
    })
  } else {
    win.window.on('show', () => {
      migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
        if (err) { log.warn(err); rollbar.warn(err) }
        event.sender.send('state-fetched', json, win.fileName, dirty)
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
  dialog.showMessageBox(buyWindow, {type: 'info', buttons: ['ok'], message: 'Verifying your license. Please wait...', detail: licenseString}, function (choice) {})
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
      dialog.showErrorBox('License verification failed', 'Try again by clicking in the menu: Plottr > Verify License...')
    } else {
      if (body.success && !body.purchase.refunded && !body.purchase.chargebacked) {
        // save uses, purchase.email, purchase.full_name, purchase.variants
        storage.set('user_info', body, function(err) {
          if (err) {
            logger.error(err)
            dialog.showErrorBox('License verification failed', 'Try again by clicking in the menu: Plottr > Verify License...')
          } else {
            dialog.showMessageBox({type: 'info', buttons: ['ok'], message: 'License verified! You\'re all set.', detail: 'Now let\'s get to the good stuff'}, function () {
              licenseVerified()
            })
          }
        })
      }
    }
  })
})

async function licenseVerified () {
  if (verifyWindow) verifyWindow.close()
  if (buyWindow) buyWindow.close()
  if (TRIALMODE) {
    turnOffTrialMode()
    await rebuildApplicationMenu();
    askToOpenOrCreate()
  } else {
    openRecentFiles()
  }
}

ipcMain.on('license-verified', function () {
  licenseVerified()
})

ipcMain.on('report-window-requested', openReportWindow)

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
    checkLicense(async function() {
      await rebuildApplicationMenu();

      if (process.platform === 'darwin') {
        let dockMenu = Menu.buildFromTemplate([
          {label: 'Create a new file', click: function () {
            askToCreateFile()
          }},
        ])
        app.dock.setMenu(dockMenu)
      }
    })
  }
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
      if (TRIALMODE) openTour()
      else openVerifyWindow()
    }
  })
}

function turnOffTrialMode() {
  if (process.env.NODE_ENV !== 'dev') {
    TRIALMODE = false
    process.env.TRIALMODE = 'false'
    var env = {
      ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
      TRIALMODE: 'false'
    }
    var envstr = stringify(env)

    fs.writeFileSync(path.join('..','.env'), envstr)
  }
}

function saveFile (fileName, data, callback) {
  var stringState = JSON.stringify(data, null, 2)
  fs.writeFile(fileName, stringState, callback)
}

function displayFileName (path) {
  var stringBase = 'Plottr'
  if (TRIALMODE) stringBase += ' — TRIAL VERSION'
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
    recentFilesManager.getMostRecentFile().then(function (result) {
      openWindow(result);
    },
    function (rejectReason) {
      log.warn(rejectReason);
      rollbar.warn(rejectReason);
      openTour();
    });
  }
}

function askToSave (win, state, callback) {
  dialog.showMessageBox(win, {type: 'question', buttons: ['yes, save!', 'no, just exit'], defaultId: 0, message: 'Would you like to save before exiting?'}, function (choice) {
    if (choice === 0) {
      saveFile(win.fileName, state, function (err) {
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
  dialog.showSaveDialog({title: 'Where would you like to start your new file?'}, function (fileName) {
    if (fileName) {
      var fullName = fileName + '.pltr'
      openWindow(fullName, true)
      saveFile(fullName, {}, function (err) {
        if (err) {
          log.warn(err)
          log.warn('file name: ' + fullName)
          rollbar.warn(err, {fileName: fullName})
          dialog.showErrorBox('Saving failed', 'Creating your file didn\'t work. Let\'s try again.')
          askToCreateFile()
        } else {
          app.addRecentDocument(fileName);
          recentFilesManager.addFileToRecentsList(fullName).then(
            function (result) { 
              rebuildApplicationMenu() 
            }, 
            function (rejectReason) {
            log.warn(rejectReason);
            rollbar.warn(rejectReason);
            // TODO: notify user? Maybe not?
          })
        }
      })
    }
  })
}

function askToOpenOrCreate () {
  dontquit = true
  dialog.showMessageBox({type: 'question', buttons: ['open', 'new'], message: 'Would you like to open an existing file or start a new file?'}, (choice) => {
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
  dialog.showOpenDialog(win, { properties: properties }, function (chosenFileName) {
    if (chosenFileName && chosenFileName.length > 0) {
      openWindow(chosenFileName[0])
    }
  })
}

function openWindow (fileName, newFile = false) {
  // Create the browser window.
  let newWindow = new BrowserWindow({width: 1200, height: 800, show: false, backgroundColor: '#efefee', webPreferences: {scrollBounce: true}})

  // and load the app.html of the app.
  const entryFile = path.join(filePrefix, 'app.html')
  newWindow.loadURL(entryFile)

  newWindow.once('ready-to-show', function() {
    this.show()
  })

  // at this point, verification will always be done
  dontquit = false

  newWindow.webContents.on('did-finish-load', () => {
    if (!launchSent) {
      newWindow.webContents.send('send-launch', app.getVersion())
    }
  })

  if (process.env.NODE_ENV === 'dev' && process.env.SUPPRESS_DEVTOOLS === undefined) {
    newWindow.openDevTools()
  }

  newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    var win = _.find(windows, {id: this.id})
    if (checkDirty(win.state, win.lastSave)) {
      e.preventDefault()
      var _this = this
      askToSave(this, win.state,  function() {
        dereferenceWindow(win)
        // TODO: if changes weren't saved (checkDirty(win.state, win.lastSave)), flush the history from local storage
        _this.destroy() // TODO: also handle when the app is trying to quit
      })
    } else {
      dereferenceWindow(win)
    }
  })

  try {
    var json = {}
    if (!newFile) {
      json = JSON.parse(fs.readFileSync(fileName, 'utf-8'))
      json.file.fileName = updateFileExtenstion(json.file.fileName)
    }
    fileName = updateFileExtenstion(fileName)
    app.addRecentDocument(fileName);
    recentFilesManager.addFileToRecentsList(fileName).then(
      function(r) {}, 
      function(rejectReason) {
        log.warn(rejectReason);
        rollbar.warn(rejectReason);
      });

    windows.push({
      id: newWindow.id,
      window: newWindow,
      fileName: fileName,
      state: json,
      lastSave: json
    })

    newWindow.webContents.send('open-file', app.getVersion(), windows.length)

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
  // if we never saved the file, we don't need to keep its recents record
  if (!fs.existsSync(winObj.fileName)) {
    removeRecentFile(winObj.fileName)
  }
  windows = _.reject(windows, function (win) {
    return win.id === winObj.id
  })
}

function closeWindow (id) {
  let win = _.find(windows, {id: id})
  let windowFile = win.fileName
  win.window.close()
}

async function removeRecentFile (fileNameToRemove) {
  await recentFilesManager.removeRecentFile(fileNameToRemove)
  await rebuildApplicationMenu()
}

async function rebuildApplicationMenu() {
   // also mess with the recents menu
   let menuTemplate = await buildMenu()
   let menu = Menu.buildFromTemplate(menuTemplate)
   Menu.setApplicationMenu(menu);
}

function openTour () {
  openWindow(__dirname + '/tour.pltr')
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

function openReportWindow () {
  const reportFile = path.join(filePrefix, 'report.html')
  reportWindow = new BrowserWindow({frame: false, show: false})
  reportWindow.loadURL(reportFile)
  reportWindow.once('ready-to-show', function() {
    this.show()
  })
  reportWindow.on('close', function () {
    reportWindow = null
  })
}

function openBuyWindow () {
  const buyFile = path.join(filePrefix, 'buy.html')
  buyWindow = new BrowserWindow({height: 600, show: false})
  buyWindow.loadURL(buyFile)
  buyWindow.once('ready-to-show', function() {
    this.show()
  })
  buyWindow.on('close', function () {
    reportWindow = null
  })
}

function gracefullyQuit () {
  dialog.showMessageBox({type: 'info', buttons: ['ok'], message: 'Plottr ran into a problem. Try opening Plottr again.', detail: 'If you keep seeing this problem, email me at cameronsutter0@gmail.com'}, function (choice) {
    app.quit()
  })
}

function gracefullyNotSave () {
  dialog.showErrorBox('Saving failed', 'Saving your file didn\'t work. Try again.')
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
      dialog.showMessageBox({type: 'info', buttons: ['ok'], message: 'Email me at cameronsutter0@gmail.com with the file Plottr just exported', detail: 'Please email me the file named plottr_error_report.txt in your Documents folder'})
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
      dialog.showErrorBox('Update Plottr', 'It looks like your file was saved with a newer version of Plottr than you\'re using now. That could cause problems. Try updating Plottr and starting it again.')
      callback('Update Plottr', false, json)
    } else {
      // ask user to try to migrate
      dialog.showMessageBox(win, {type: 'question', buttons: ['yes, update the file', 'no, open the file as-is'], defaultId: 0, message: 'It looks like you have an older file version. This could make things work funky or not at all. May Plottr update it for you?', detail: '(It will save a backup first which will be saved to the same folder as this file)'}, (choice) => {
        if (choice === 0) {
          m.migrate((err, json) => {
            if (err === 'backup') {
              dialog.showErrorBox('Problem saving backup', 'Plottr couldn\'t save a backup. It hasn\'t touched your file yet, so don\'t worry. Try quitting Plottr and starting it again.')
              callback('problem saving backup', false, json)
            } else {
              // tell the user that Plottr migrated versions and saved a backup file
              dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr updated your file without a problem. Don\'t forget to save your file.'})
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
              dialog.showErrorBox('Problem saving backup', 'Plottr tried saving a backup just in case, but it didn\'t work. Try quitting Plottr and starting it again.')
            } else {
              dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr saved a backup just in case and now on with the show (To use the backup, remove \'.backup\' from the file name)'})
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

async function buildMenu () {
  return [
    buildPlottrMenu(),
    await buildFileMenu(),
    buildEditMenu(),
    buildViewMenu(),
    buildWindowMenu(),
    buildHelpMenu()
  ]
}

function buildPlottrMenu () {
  var submenu = [{
    label: 'About Plottr',
    click: openAboutWindow
  }]
  if (TRIALMODE) {
    submenu = [].concat({
      type: 'separator'
    }, {
      label: 'Buy the Full Version...',
      click: openBuyWindow
    }, {
      label: 'Enter License...',
      click: openVerifyWindow
    }, {
      type: 'separator'
    })
  }
  submenu = [].concat({
    label: 'Open the Tour...',
    click: openTour
  }, {
    type: 'separator'
  }, {
    label: 'Report a Problem',
    sublabel: 'Creates a report to email me',
    click: function () {
      let report = prepareErrorReport()
      sendErrorReport(report)
    }
  }, {
    label: 'Give feedback...',
    click: openReportWindow
  }, {
    label: 'Request a feature...',
    click: openReportWindow
  })
  if (process.platform === 'darwin') {
    submenu = [].concat({
      type: 'separator'
    }, {
      label: 'Hide Plottr',
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Cmd+Q',
      click: function () {
        // TODO: check for dirty files open
        app.quit()
      }
    })
  } else {
    submenu = [].concat({
      label: 'Close',
      accelerator: 'Alt+F4',
      click: function () {
        // TODO: check for dirty files open
        app.quit()
      }
    })
  }
  return {
    label: 'Plottr',
    submenu: submenu
  }
}

async function buildFileMenu () {
  let recentsList =  await recentFilesManager.recents;
  let fileOpenRecentsMenu = null;
  if (recentsList.length > 1 && !TRIALMODE) {
      fileOpenRecentsMenu = {
      label: openRecentFileMenuItemName,
      submenu: recentsList.map(element => {
        return {
          label: element,
          click: function () {
            openWindow(element);
          }
        };
      })
    };
  }

  var closeMenuItem = {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      if (win) {
        let winObj = _.find(windows, {id: win.id})
        if (winObj) {
          if (process.env.NODE_ENV !== 'dev') {
            if (checkDirty(winObj.state, winObj.lastSave)) {
              askToSave(win, winObj.state, function () { closeWindow(win.id) })
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
  }

  var submenu = [].concat({
    label: 'New...',
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+N',
    click: askToCreateFile
  }, {
    label: 'Open...',
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+O',
    click: askToOpenFile
  });
  if (fileOpenRecentsMenu !== null) {
    submenu.push(fileOpenRecentsMenu);
  }
  submenu = submenu.concat(
  {
    type: 'separator'
  }, 
  {
    label: 'Save',
    enabled: !TRIALMODE,
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
    label: 'Save as...',
    enabled: !TRIALMODE,
    accelerator: 'CmdOrCtrl+Shift+S',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (winObj) {
        dialog.showSaveDialog(win, {title: 'Where would you like to save this copy?'}, function (fileName) {
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
  }, closeMenuItem)
  return {
    label: 'File',
    submenu: submenu
  }
}

function buildEditMenu () {
  return {
    label: 'Edit',
    submenu: [{
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      type: 'separator'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }
}

function buildViewMenu () {
  var submenu = [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      let winObj = _.find(windows, {id: win.id})
      if (process.env.NODE_ENV !== 'dev') {
        if (checkDirty(winObj.state, winObj.lastSave)) {
          askToSave(win, winObj.state, win.webContents.reload)
        } else {
          win.webContents.reload()
        }
      } else {
        win.webContents.reload()
      }
    }
  }, {
    label: 'Take Screenshot...',
    accelerator: 'CmdOrCtrl+P',
    click: takeScreenshot
  }, {
    label: 'Show Dev Tools',
    accelerator: 'CmdOrCtrl+D',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      win.openDevTools()
    }
  }]
  return {
    label: 'View',
    submenu: submenu
  }
}

function buildWindowMenu () {
  return {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  }
}

function buildHelpMenu () {
  return {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Report a Problem',
        sublabel: 'Creates a report to email me',
        click: function () {
          let report = prepareErrorReport()
          sendErrorReport(report)
        }
      },
      {
        label: 'Give feedback...',
        click: openReportWindow
      },
      {
        label: 'Request a feature...',
        click: openReportWindow
      }
    ]
  }
}

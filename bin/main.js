const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
var Migrator = require('./migrator/migrator')
var Exporter = require('./exporter')
var fs = require('fs')
var path = require('path')
var deep = require('deep-diff')
var _ = require('lodash')
var storage = require('electron-json-storage')
var Rollbar = require('rollbar')
if (process.env.NODE_ENV === 'dev') {
  require('dotenv').config()
}

const USER_INFO = 'user_info'
var TRIALMODE = false
try {
  require('../trialmode.json')
  TRIALMODE = true
} catch (e) {
  // not in trial mode
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windows = []
var aboutWindow = null
var verifyWindow = null
var reportWindow = null

var fileToOpen = null

const filePrefix = process.platform === 'darwin' ? 'file://' + __dirname : __dirname
const recentKey = process.env.NODE_ENV === 'dev' ? 'recentFilesDev' : 'recentFiles'

// mixpanel tracking
var tracker = false

////////////////////////////////
////     Bug Reporting    //////
////////////////////////////////

let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
  handleUnhandledRejections: true,
  ignoredMessages: []
})
if (process.env.NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    Rollbar.error(err, function(sendErr, data) {
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
    app.quit()
  }
  // if (process.env.NODE_ENV === 'dev') app.quit()

  // app.quit()
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
    checkLicense()
  }
})

ipcMain.on('save-state', function (event, state, winId) {
  var winObj = _.find(windows, {id: winId})
  let edited = checkDirty(state, winObj.lastSave)
  winObj.window.setDocumentEdited(edited)
  winObj.window.setTitle(displayFileName(winObj.fileName))
  winObj.window.setRepresentedFilename(winObj.fileName)

  // save the new state
  winObj.state = state
  if (edited) {
    saveFile(winObj.fileName, state, function (err) {
      if (err) {
        rollbar.error(err)
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
  if (win.state.file) {
    win.window.setTitle(displayFileName(win.fileName))
    win.window.setRepresentedFilename(win.fileName)
  }

  if (win.window.isVisible()) {
    migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
      if (err) rollbar.warn(err)
      event.sender.send('state-fetched', json, win.fileName, dirty)
    })
  } else {
    win.window.on('show', () => {
      migrateIfNeeded (win.window, win.state, win.fileName, function(err, dirty, json) {
        if (err) rollbar.warn(err)
        event.sender.send('state-fetched', json, win.fileName, dirty)
      })
    })
  }
})

ipcMain.on('tracker-initialized', function (event) {
  tracker = true
})

ipcMain.on('license-verified', function () {
  verifyWindow.close()
  openRecentFiles()
})

ipcMain.on('report-window-requested', openReportWindow)

ipcMain.on('export', function (event, options, winId) {
  var winObj = _.find(windows, {id: winId})
  Exporter(winObj.state, options)
})

app.on('ready', function () {
  if (process.env.NODE_ENV === 'license') {
    const fakeData = require('./devLicense')
    storage.set(USER_INFO, fakeData, function(err) {
      if (err) console.log(err)
      else console.log('dev license created')
      app.quit()
    })
  } else {
    var template = buildMenu()
    var menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    if (process.platform === 'darwin') {
      let dockMenu = Menu.buildFromTemplate([
        {label: 'Create a new file', click: function () {
          askToCreateFile()
        }},
      ])
      app.dock.setMenu(dockMenu)
    }

    checkLicense()
  }
})

////////////////////////////////
///////   FUNCTIONS   //////////
////////////////////////////////

function checkLicense () {
  if (TRIALMODE) {
    openAboutWindow()
    openTour()
  } else {
    storage.has(USER_INFO, function (err, hasKey) {
      if (err) console.log(err)
      if (hasKey) {
        storage.get(USER_INFO, function (err, data) {
          if (data.success) openRecentFiles()
          else openVerifyWindow()
        })
      } else {
        openVerifyWindow()
      }
    })
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
  if (process.platform === 'win32' && process.argv.length >= 2) {
    openWindow(process.argv[1])
  } else if (fileToOpen) {
    openWindow(fileToOpen)
    fileToOpen = null
  } else {
    storage.has(recentKey, function (err, hasKey) {
      if (err) console.log(err)
      if (hasKey) {
        storage.get(recentKey, function (err, fileName) {
          if (err) console.log(err)
          openWindow(fileName)
        })
      } else {
        openAboutWindow()
        openTour()
      }
    })
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
          rollbar.error(err)
          dialog.showErrorBox('Saving failed', 'Creating your file didn\'t work. Let\'s try again.')
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

  newWindow.webContents.on('did-finish-load', () => {
    if (!tracker) {
      newWindow.webContents.send('init-tracker', app.getVersion())
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    // Open the DevTools.
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

    newWindow.setTitle(displayFileName(fileName))
    newWindow.setRepresentedFilename(fileName)
  } catch (err) {
    rollbar.warn(err)
    console.log(err)
    removeRecentFile(fileName)
    newWindow.destroy()
    askToOpenOrCreate()
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

function gracefullyQuit () {
  dialog.showMessageBox({type: 'info', buttons: ['ok'], message: 'Plottr ran into a problem. Try opening Plottr again.', detail: 'If you keep seeing this problem, email me at cameronsutter0@gmail.com'}, function (choice) {
    app.quit()
  })
}

function gracefullyNotSave () {
  dialog.showErrorBox('Saving failed', 'Saving your file didn\'t work. Try again.')
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
  if (m.areSameVersion()) {
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
              rollbar.error(err)
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
  return {
    label: 'Plottr',
    submenu: [ {
      label: 'About Plottr',
      click: openAboutWindow
    }, {
      label: 'Open the Tour...',
      click: openTour
    }, {
      type: 'separator'
    }, {
      label: 'Report a Problem...',
      click: openReportWindow
    }, {
      label: 'Give feedback...',
      click: openReportWindow
    }, {
      label: 'Request a feature...',
      click: openReportWindow
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
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
    }]
  }
}

function buildFileMenu () {
  var submenu = [{
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
  }]
  if (!TRIALMODE) {
    var submenu = [].concat({
      label: 'New...',
      accelerator: 'CmdOrCtrl+N',
      click: askToCreateFile
    }, {
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click: askToOpenFile
    }, {
      type: 'separator'
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click: function () {
        let win = BrowserWindow.getFocusedWindow()
        let winObj = _.find(windows, {id: win.id})
        if (winObj) {
          saveFile(winObj.state.file.fileName, winObj.state, function (err) {
            if (err) {
              rollbar.error(err)
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
                  rollbar.error(err)
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
  }
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
  },{
    label: 'Take Screenshot...',
    accelerator: 'CmdOrCtrl+P',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
      win.capturePage(function (image) {
        if (process.env.NODE_ENV === 'dev') {
          var version = app.getVersion()
          var folderPath = path.join(process.env.HOME, 'plottr_dist', version, 'screenshots')
          var date = new Date()
          var timestamp = '' + date.getMinutes() + date.getSeconds()
          var fileName = 'shot' + timestamp + '.png'
          var filePath = path.join(folderPath, fileName)
          let stat = fs.stat(folderPath, (err, stat) => {
            if (err) {
              fs.mkdir(folderPath, (err) => {
                if (err) {
                  rollbar.warn(err)
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
  }]
  if (!TRIALMODE) submenu.push({
    label: 'Show Dev Tools',
    accelerator: '',
    click: function () {
      let win = BrowserWindow.getFocusedWindow()
      win.openDevTools()
    }
  })
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
        label: 'Report a Problem...',
        click: openReportWindow
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

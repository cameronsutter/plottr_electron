const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
var fs = require('fs')
var deep = require('deep-diff')

// TODO: Report crashes to our server.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null
var aboutWindow = null

var autosave = null

// state of the app to be saved
var stateOfApp = {}
var lastSave = {}

// app's entry file
var entryFile = 'file://' + __dirname + '/index.html'

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  // if (process.env.NODE_ENV === 'dev') app.quit()

  app.quit()
})

app.on('open-file', function (event, path) {
  // do the file opening here
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    openWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  openWindow()

  ipcMain.on('save-state', function (event, state) {
    if (!lastSave['file']) {
      lastSave = state
      lastSave['file']['dirty'] = true
    }
    var edited = checkDirty(state)
    mainWindow.setDocumentEdited(edited)
    mainWindow.setTitle(displayFileName(state.file.fileName))
    stateOfApp = state
  })

  ipcMain.on('error-on-open', function (event) {
    askToOpenFile()
  })

  var template = [
    {
      label: 'Plottr',
      submenu: [ {
        label: 'About Plottr',
        click: function () {
          var aboutFile = 'file://' + __dirname + '/about.html'
          aboutWindow = new BrowserWindow({width: 400, height: 550})
          aboutWindow.loadURL(aboutFile)
          aboutWindow.on('closed', function () {
            aboutWindow = null
          })
        }
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
          app.quit()
        }
      }]
    }, {
      label: 'File',
      submenu: [{
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: function () {
          saveFile(stateOfApp.file.fileName, stateOfApp, function (err) {
            if (err) throw err
            else {
              mainWindow.webContents.send('state-saved')
              lastSave = stateOfApp
              // TODO: this
              mainWindow.setDocumentEdited(false)
            }
          })
        }
      }, {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: function () {
          if (!process.env.NODE_ENV === 'dev') {
            if (mainWindow && checkDirty(stateOfApp)) askToSave(stateOfApp, askToOpenFile)
            else askToOpenFile()
          } else askToOpenFile()
        }
      }, {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: function () {
          if (!process.env.NODE_ENV === 'dev') {
            if (mainWindow && checkDirty(stateOfApp)) askToSave(stateOfApp, askToCreateFile)
            else askToCreateFile()
          } else askToCreateFile()
        }
      }]
    }, {
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
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }]
    }, {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
          if (!process.env.NODE_ENV === 'dev') {
            if (checkDirty(stateOfApp)) {
              askToSave(stateOfApp, mainWindow.webContents.reload)
            } else {
              mainWindow.webContents.reload()
            }
          } else {
            mainWindow.webContents.reload()
          }
        }
      }, {
        label: 'Show Dev Tools',
        accelerator: '',
        click: function () {
          mainWindow.openDevTools()
        }
      }]
    }, {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }, {
          type: 'separator'
        }, {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    }, {
      label: 'Help',
      role: 'help',
      submenu: []
    }
  ]

  var menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

function saveFile (fileName, data, callback) {
  if (data.file) data.file.version = app.getVersion()
  var stringState = JSON.stringify(data, null, 2)
  fs.writeFile(fileName, stringState, callback)
}

function displayFileName (path) {
  var matches = path.match(/.*\/(.*\.plottr)/)
  if (matches) return `Plottr — ${matches[1]}`
  return 'Plottr'
}

function checkDirty (state) {
  var diff = deep.diff(lastSave, state) || []
  var edited = false
  if (state.file && state.file.dirty && diff.length > 0) edited = true
  return edited
}

function askToSave (state, callback) {
  dialog.showMessageBox(mainWindow, {type: 'question', buttons: ['yes, save!', 'no, just exit'], defaultId: 0, message: 'Would you like to save before exiting?'}, function (choice) {
    if (choice === 0) {
      saveFile(state.file.fileName, state, function (err) {
        if (err) throw err
        else {
          if (typeof callback === 'string') mainWindow[callback]()
          else callback()
        }
      })
    } else {
      if (typeof callback === 'string') mainWindow[callback]()
      else callback()
    }
  })
}

function askToCreateFile () {
  dialog.showSaveDialog({title: 'Where would you like to start your new file?'}, function (fileName) {
    if (fileName) {
      if (mainWindow === null) {
        openWindow()
      }
      lastSave = {}
      stateOfApp = {}
      var fullName = fileName + '.plottr'
      mainWindow.webContents.send('new-file', fullName)
      saveFile(fullName, stateOfApp, function (err) {
        if (err) throw err
      })
    }
  })
}

function askToOpenFile () {
  var properties = [ 'openFile', 'createDirectory' ]
  dialog.showOpenDialog(mainWindow, { properties: properties }, function (chosenFileName) {
    if (chosenFileName && chosenFileName.length > 0) {
      if (mainWindow === null) {
        openWindow()
      }
      mainWindow.webContents.send('open-file', chosenFileName[0])
    }
  })
}

function openWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 800})

  // and load the index.html of the app.
  mainWindow.loadURL(entryFile)

  if (process.env.NODE_ENV === 'dev') {
    // Open the DevTools.
    mainWindow.openDevTools()
  }

  if (process.env.NODE_ENV !== 'dev') {
    autosave = setInterval(function () {
      if (checkDirty(stateOfApp)) {
        saveFile(stateOfApp.file.fileName, stateOfApp, function (err) {
          if (err) throw err
          else {
            mainWindow.webContents.send('state-saved')
            lastSave = stateOfApp
            // TODO: this
            mainWindow.setDocumentEdited(false)
          }
        })
      }
    }, 1000 * 60 * 5) // every 5 minutes
  }

  mainWindow.on('blur', function () {
    if (autosave) clearInterval(autosave)
  })

  mainWindow.on('focus', function () {
    if (!autosave && process.env.NODE_ENV !== 'dev') {
      autosave = setInterval(function () {
        if (checkDirty(stateOfApp)) {
          saveFile(stateOfApp.file.fileName, stateOfApp, function (err) {
            if (err) throw err
            else {
              mainWindow.webContents.send('state-saved')
              lastSave = stateOfApp
              // TODO: this
              mainWindow.setDocumentEdited(false)
            }
          })
        }
      }, 1000 * 60 * 5) // every 5 minutes
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    mainWindow = null
  })

  mainWindow.on('close', function (e) {
    if (checkDirty(stateOfApp)) {
      e.preventDefault()
      askToSave(stateOfApp, 'destroy')
    }
  })
}

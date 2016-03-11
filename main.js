var app = require('app')  // Module to control application life.
var BrowserWindow = require('browser-window') // Module to create native browser window.
var Menu = require('menu')
var fs = require('fs')
var ipc = require('ipc')
var dialog = require('dialog')

// Report crashes to our server.
require('crash-reporter').start()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null

// state of the app to be saved
var stateOfApp = {}

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 800})

  // and load the index.html of the app.
  mainWindow.loadUrl(entryFile)

  if (process.env.NODE_ENV === 'dev') {
    // Open the DevTools.
    mainWindow.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    mainWindow = null
  })

  mainWindow.on('close', function (e) {
    // ask to save
    if (stateOfApp.file.dirty) {
      e.preventDefault()
      dialog.showMessageBox(mainWindow, {type: 'question', buttons: ['yes, save!', 'no, just exit'], defaultId: 0, message: 'Would you like to save before exiting?'}, (choice) => {
        if (choice === 0) {
          console.log('saving!')
          saveFile(stateOfApp.file.fileName, stateOfApp, (err) => {
            if (err) throw err
            mainWindow.destroy()
          })
        } else {
          mainWindow.destroy()
        }
      })
    }
  })

  ipc.on('save-state', (event, state) => {
    stateOfApp = state
    mainWindow.setTitle(displayFileName(state.file.fileName))
    if (state.file.dirty) mainWindow.setDocumentEdited(true)
  })

  var template = [
    {
      label: 'Plottr',
      submenu: [ {
        label: 'About Plottr',
        role: 'about'
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
          saveFile(stateOfApp.file.fileName, stateOfApp, (err) => {
            if (err) throw err
            mainWindow.webContents.send('state-saved')
            // TODO: this
            mainWindow.setDocumentEdited(false)
          })
        }
      }, {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: function () {
          var properties = [ 'openFile', 'openDirectory', 'createDirectory' ]
          dialog.showOpenDialog(mainWindow, { properties: properties }, (chosenFileName) => {
            if (chosenFileName.length > 0) {
              mainWindow.webContents.send('open-file', chosenFileName[0])
            }
          })
        }
      }, {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: function () {
          dialog.showSaveDialog({title: 'Where would you like to start your new file?'}, function (fileName) {
            if (fileName) {
              mainWindow.webContents.send('new-file', fileName + '.plottr')
            }
          })
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
          mainWindow.webContents.reload()
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
  data.file.version = app.getVersion()
  var stringState = JSON.stringify(data)
  fs.writeFile(fileName, stringState, callback)
}

function displayFileName (path) {
  var matches = path.match(/.*\/(.*\.plottr)/)
  return `Plottr — ${matches[1]}`
}

function checkVersion (given, appVersion) {
  if (given === appVersion) {
    return true
  } else {
    var givenArray = given.split('.')
    var versionArray = appVersion.split('.')
    if (givenArray[0] === versionArray[0]) {
      // major version is the same
      if (givenArray[1] === versionArray[1]) {
        // minor version is the same
        return true
      }
    }
  }
}

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var dialog = require('dialog');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

app.on('open-file', function(event, path){
  //do the file opening here
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 800});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  template = [{
      label: 'Plottr',
      submenu: [{
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          app.quit();
        }
      }]
    }, {
      label: 'File',
      submenu: [{
        label: 'Save',
        role: 'saveFile'
      },{
        label: 'Open',
        role: 'openFile'
      }, {
        label: 'New',
        role: 'newFile'
      }]
    }
  ]

  menu = Menu.buildFromTemplate(template);
  mainWindow.setMenu(menu);



  dialog.showOpenDialog(mainWindow, { properties: [ 'openFile', 'openDirectory', 'createDirectory' ]}, callback: function(filename){
  // Open file here 
  })
});
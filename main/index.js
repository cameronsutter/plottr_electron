const electron = require('electron')
const SETTINGS = require('./modules/settings')
const { setupI18n } = require('plottr_locales')
setupI18n(SETTINGS, { electron })

const fs = require('fs')
const { app, BrowserWindow, ipcMain, globalShortcut } = electron
const path = require('path')
const log = require('electron-log')
const { is } = require('electron-util')
require('./modules/updater_events')
const contextMenu = require('electron-context-menu')
const { setupRollbar } = require('./modules/rollbar')
const { loadMenu } = require('./modules/menus')
const {
  focusFirstWindow,
  hasWindows,
  getWindowById,
  numberOfWindows,
} = require('./modules/windows')
const { openProjectWindow } = require('./modules/windows/projects')
const { setDarkMode, broadcastDarkMode } = require('./modules/theme')
const { newFileOptions } = require('./modules/new_file_options')
const { gracefullyQuit } = require('./modules/utils')
const { addToKnown, knownFilesStore, addToKnownFiles } = require('./modules/known_files')
const {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
} = require('./modules/feature_flags')
const { reloadAllWindows } = require('./modules/windows')
const { broadcastToAllWindows } = require('./modules/broadcast')
const {
  openKnownFile,
  createNew,
  createFromSnowflake,
  saveFile,
  TEMP_FILES_PATH,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  editKnownFilePath,
} = require('./modules/files')
const { editWindowPath } = require('./modules/windows/index')

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
const ENV_FILE_PATH = path.resolve('.env')
require('dotenv').config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (!is.development) {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function (sendErr, data) {
      gracefullyQuit()
    })
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }
}

app.whenReady().then(() => {
  loadMenu(true)
  // TODO: not necesarily latest...
  const files = Object.values(knownFilesStore.store)
    .sort((thisFile, thatFile) => {
      if (thisFile.lastOpened > thatFile.lastOpened) return -1
      if (thisFile.lastOpened < thatFile.lastOpened) return 1
      return 0
    })
    .filter((file) => fs.existsSync(file.path))
  const latestFile = files[0]
  if (!latestFile) {
    createNew()
  } else {
    openProjectWindow(latestFile.path)
  }
  windowsOpenFileEventHandler(process.argv)

  // Register the toggleDevTools shortcut listener.
  globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  if (process.env.NODE_ENV != 'dev') {
    app.setAsDefaultProtocolClient('plottr')
  }

  app.on('activate', () => {
    if (hasWindows()) {
      focusFirstWindow()
    } else {
      reloadAllWindows()
    }
  })
  app.on('second-instance', (event, argv, workingDirectory) => {
    log.info('second-instance')
    loadMenu(true)
    windowsOpenFileEventHandler(argv)
  })
})

function windowsOpenFileEventHandler(argv) {
  if (is.windows && process.env.NODE_ENV != 'dev') {
    log.info('windows open-file event handler')
    log.info('args', argv.length, argv)
    const param = argv[argv.length - 1]

    if (param.includes('.pltr')) {
      openProjectWindow(param)
      addToKnown(param)
    }

    // windows custom protocol link handler
    // log.info('open-url event: ' + param)
    // const link = param.replace('plottr://')
  }
}

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  // mac/linux open-file event handler
  app.whenReady().then(() => {
    openProjectWindow(filePath)
    addToKnown(filePath)
  })
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})

ipcMain.once('initial-mount-complete', (event) => {
  event.reply('open-dashboard')
})

ipcMain.on('pls-fetch-state', function (event, id) {
  const win = getWindowById(id)
  if (win) {
    event.sender.send('state-fetched', win.filePath, newFileOptions(), numberOfWindows())
  }
})

ipcMain.on('pls-set-dark-setting', (_, newValue) => {
  setDarkMode(newValue)
  broadcastDarkMode()
})

ipcMain.on('pls-update-beat-hierarchy-flag', (_, newValue) => {
  if (newValue) {
    broadcastSetBeatHierarchy()
  } else {
    broadcastUnsetBeatHierarchy()
  }
})

ipcMain.on('pls-update-language', (_, newLanguage) => {
  SETTINGS.set('locale', newLanguage)
  setupI18n(SETTINGS, { electron })
  require('./modules/menus').loadMenu()
  reloadAllWindows()
})

ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('add-to-known-files-and-open', (event, file) => {
  const id = addToKnownFiles(file)
  openKnownFile(file, id, false)
})

ipcMain.on('create-new-file', (event, template) => {
  createNew(template)
})

ipcMain.on('create-from-snowflake', (event, importedPath) => {
  createFromSnowflake(importedPath)
})

ipcMain.on('open-known-file', (event, filePath, id, unknown) => {
  openKnownFile(filePath, id, unknown)
})

ipcMain.on('save-file', (event, fileName, file) => {
  saveFile(fileName, file)
})

ipcMain.on('remove-from-temp-files-if-temp', (event, filePath) => {
  if (filePath.includes(TEMP_FILES_PATH)) {
    removeFromTempFiles(filePath, false)
  }
})

ipcMain.on('broadcast-reload-options', () => {
  broadcastToAllWindows('reload-options')
})

ipcMain.on('remove-from-known-files', (event, fileId) => {
  removeFromKnownFiles(fileId)
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('delete-known-file', (event, id, filePath) => {
  deleteKnownFile(id, filePath)
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('edit-known-file-path', (event, oldFilePath, newFilePath) => {
  editKnownFilePath(oldFilePath, newFilePath)
  editWindowPath(oldFilePath, newFilePath)
  broadcastToAllWindows('reload-recents')
})

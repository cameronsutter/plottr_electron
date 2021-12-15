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
  autoSave,
} = require('./modules/files')
const { editWindowPath } = require('./modules/windows/index')
const { ensureBackupTodayPath, saveBackup } = require('./modules/backup')

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
require('dotenv').config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (!is.development) {
  process.on('uncaughtException', function (error) {
    log.error(error)
    rollbar.error(error, function (sendErr, data) {
      gracefullyQuit()
    })
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }
}

app.userAgentFallback =
  'Firefox Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) plottr/2021.7.29 Chrome/85.0.4183.121 Electron/10.4.7 Safari/537.36'

app.whenReady().then(async () => {
  loadMenu()
  const files = Object.values(knownFilesStore.store)
    .sort((thisFile, thatFile) => {
      if (thisFile.lastOpened > thatFile.lastOpened) return -1
      if (thisFile.lastOpened < thatFile.lastOpened) return 1
      return 0
    })
    .filter((file) => fs.existsSync(file.path))
  const latestFile = files[0]
  if (latestFile) {
    openProjectWindow(latestFile.path)
  } else {
    await createNew()
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

  app.on('activate', async () => {
    if (hasWindows()) {
      focusFirstWindow()
    } else {
      if (latestFile) {
        openProjectWindow(latestFile.path)
      } else {
        await createNew()
      }
    }
  })
  app.on('second-instance', (_event, argv) => {
    log.info('second-instance')
    loadMenu()
    windowsOpenFileEventHandler(argv)
  })
  app.on('window-all-closed', () => {
    if (is.windows) app.quit()
  })
  app.on('will-quit', () => {
    app.releaseSingleInstanceLock()
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

ipcMain.on('pls-fetch-state', function (event, id) {
  const win = getWindowById(id)
  if (win) {
    event.sender.send('state-fetched', win.filePath, newFileOptions(), numberOfWindows())
  }
})

ipcMain.on('pls-set-dark-setting', (_event, newValue) => {
  setDarkMode(newValue)
  broadcastDarkMode()
})

ipcMain.on('pls-update-beat-hierarchy-flag', (_event, newValue) => {
  if (newValue) {
    broadcastSetBeatHierarchy()
  } else {
    broadcastUnsetBeatHierarchy()
  }
})

ipcMain.on('pls-update-language', (_event, newLanguage) => {
  SETTINGS.set('locale', newLanguage)
  setupI18n(SETTINGS, { electron })
  require('./modules/menus').loadMenu()
  reloadAllWindows()
})

ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('add-to-known-files-and-open', (_event, file) => {
  const id = addToKnownFiles(file)
  openKnownFile(file, id, false)
})

ipcMain.on('create-new-file', (_event, template) => {
  createNew(template)
})

ipcMain.on('create-from-snowflake', (_event, importedPath) => {
  createFromSnowflake(importedPath)
})

ipcMain.on('open-known-file', (_event, filePath, id, unknown, headerBarFileName) => {
  openKnownFile(filePath, id, unknown, headerBarFileName)
})

ipcMain.on('save-file', (_event, fileName, file) => {
  saveFile(fileName, file)
})

ipcMain.on('auto-save', (event, filePath, file, userId, previousFile) => {
  autoSave(event, filePath, file, userId, previousFile)
})

ipcMain.on('remove-from-temp-files-if-temp', (_event, filePath) => {
  if (filePath.includes(TEMP_FILES_PATH)) {
    removeFromTempFiles(filePath, false)
  }
})

ipcMain.on('broadcast-reload-options', () => {
  broadcastToAllWindows('reload-options')
})

ipcMain.on('remove-from-known-files', (_event, fileId) => {
  removeFromKnownFiles(fileId)
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('delete-known-file', (_event, id, filePath) => {
  deleteKnownFile(id, filePath)
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('edit-known-file-path', (_event, oldFilePath, newFilePath) => {
  editKnownFilePath(oldFilePath, newFilePath)
  editWindowPath(oldFilePath, newFilePath)
  broadcastToAllWindows('reload-recents')
})

ipcMain.on('ensure-backup-full-path', () => {
  ensureBackupTodayPath()
})

ipcMain.on('ensure-backup-today-path', () => {
  ensureBackupTodayPath()
})

ipcMain.on('save-backup', (event, filePath, file) => {
  saveBackup(filePath, file, (error) => {
    if (error) {
      event.sender.send('save-backup-error', error, filePath)
    } else {
      event.sender.send('save-backup-success', filePath)
    }
  })
})

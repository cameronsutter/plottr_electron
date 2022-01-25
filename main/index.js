import electron from 'electron'
import SETTINGS from './modules/settings'
import { setupI18n } from 'plottr_locales'
import { initialize } from '@electron/remote/main'

initialize()
setupI18n(SETTINGS, { electron })

const { app, BrowserWindow, ipcMain, globalShortcut } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import contextMenu from 'electron-context-menu'
import { setupRollbar } from './modules/rollbar'
import { loadMenu } from './modules/menus'
import { focusFirstWindow, hasWindows, getWindowById, numberOfWindows } from './modules/windows'
import { openProjectWindow } from './modules/windows/projects'
import { setDarkMode, broadcastDarkMode } from './modules/theme'
import { newFileOptions } from './modules/new_file_options'
import { gracefullyQuit } from './modules/utils'
import { addToKnown, addToKnownFiles } from './modules/known_files'
import { broadcastSetBeatHierarchy, broadcastUnsetBeatHierarchy } from './modules/feature_flags'
import { reloadAllWindows } from './modules/windows'
import { broadcastToAllWindows } from './modules/broadcast'
import {
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
  saveOfflineFile,
} from './modules/files'
import { lastOpenedFile } from './modules/lastOpened'
import { editWindowPath, setFilePathForWindowWithFilePath } from './modules/windows/index'
import { ensureBackupTodayPath, saveBackup } from './modules/backup'

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
import { config } from 'dotenv'
config({ path: ENV_FILE_PATH })
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
  const lastFilePath = lastOpenedFile()
  if (lastFilePath) {
    openProjectWindow(lastFilePath)
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
      if (lastFilePath) {
        openProjectWindow(lastFilePath)
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
  loadMenu()
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

ipcMain.on('record-offline-backup', (event, file) => {
  saveOfflineFile(file)
})

ipcMain.on('set-my-file-path', (event, oldFilePath, newFilePath) => {
  setFilePathForWindowWithFilePath(oldFilePath, newFilePath)
})

ipcMain.on('pls-quit', () => {
  app.quit()
})

ipcMain.on('tell-me-what-os-i-am-on', (event) => {
  event.returnValue = is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null
})

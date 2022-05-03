import electron, { shell, Notification } from 'electron'
import SETTINGS from './modules/settings'
import { setupI18n } from 'plottr_locales'
import https from 'https'
import fs from 'fs'
const { app, ipcMain } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import { loadMenu } from './modules/menus'
import { getWindowById, numberOfWindows } from './modules/windows'
import { setDarkMode } from './modules/theme'
import { newFileOptions } from './modules/new_file_options'
import { addToKnownFiles } from './modules/known_files'
import { broadcastSetBeatHierarchy, broadcastUnsetBeatHierarchy } from './modules/feature_flags'
import { reloadAllWindows } from './modules/windows'
import { openLoginPopupWindow } from './modules/windows/login'
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
  createFromScrivener,
} from './modules/files'
import { lastOpenedFile } from './modules/lastOpened'
import {
  editWindowPath,
  setFilePathForWindowWithFilePath,
  setFilePathForWindowWithId,
} from './modules/windows/index'
import { ensureBackupTodayPath, saveBackup } from './modules/backup'

export const listenOnIPCMain = (getSocketWorkerPort) => {
  ipcMain.on('pls-fetch-state', function (event, id, proMode) {
    const lastFile = lastOpenedFile()
    const lastFileIsValid =
      (proMode && lastFile && lastFile.startsWith('plottr://')) ||
      (!proMode && lastFile && !lastFile.startsWith('plottr://'))
    const win = getWindowById(id)
    const filePath = win.filePath || (lastFileIsValid ? lastFile : null)
    if (win) {
      event.sender.send(
        'state-fetched',
        filePath,
        newFileOptions(),
        numberOfWindows(),
        win.filePath
      )
    }
  })

  ipcMain.on('pls-tell-me-the-socket-worker-port', (event) => {
    event.returnValue = getSocketWorkerPort()
  })

  ipcMain.on('pls-set-dark-setting', (_event, newValue) => {
    setDarkMode(newValue)
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
    if (!file || file === '') return
    const id = addToKnownFiles(file)
    openKnownFile(file, id, false)
  })

  ipcMain.on('create-new-file', (event, template, name) => {
    createNew(template, name).catch((error) => {
      event.sender.send('error', {
        message: error.message,
        source: 'create-new-file',
      })
    })
  })

  ipcMain.on('create-from-snowflake', (event, importedPath, isLoggedIntoPro) => {
    createFromSnowflake(importedPath, event.sender, isLoggedIntoPro).catch((error) => {
      event.sender.send('error', {
        message: error.message,
        source: 'create-new-file',
      })
    })
  })

  ipcMain.on('create-from-scrivener', (event, importedPath, isLoggedIntoPro) => {
    createFromScrivener(importedPath, event.sender, isLoggedIntoPro).catch((error) => {
      event.sender.send('error', {
        message: error.message,
        source: 'create-new-file',
      })
    })
  })

  ipcMain.on('open-known-file', (_event, filePath, id, unknown, headerBarFileName) => {
    openKnownFile(filePath, id, unknown, headerBarFileName)
  })

  ipcMain.on('save-file', (event, fileName, file) => {
    saveFile(fileName, file).then(() => {
      event.sender.send('file-saved', fileName)
    })
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

  ipcMain.on('record-offline-backup', (_event, file) => {
    saveOfflineFile(file)
  })

  ipcMain.on('set-my-file-path', (_event, oldFilePath, newFilePath) => {
    setFilePathForWindowWithFilePath(oldFilePath, newFilePath)
  })

  ipcMain.on('pls-quit', () => {
    app.quit()
  })

  ipcMain.on('tell-me-what-os-i-am-on', (event) => {
    event.returnValue = is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null
  })

  ipcMain.on('download-file-and-show', (_event, url) => {
    const downloadDirectory = app.getPath('downloads')
    const fullPath = path.join(downloadDirectory, 'backup-download.pltr')
    const outputStream = fs.createWriteStream(fullPath)
    log.info(`Downloading ${url} to ${downloadDirectory}`)
    https
      .get(url, (response) => {
        if (Math.floor(response.statusCode / 200) !== 1) {
          log.error(`Error downloading file from ${url}`)
          return
        }
        response.on('data', (data) => {
          outputStream.write(data)
        })
        response.on('close', () => {
          outputStream.close((error) => {
            if (error) {
              log.error(`Error closing write stream for file download: of ${url}`, error)
            } else {
              shell.showItemInFolder(fullPath)
            }
          })
        })
      })
      .on('error', (error) => {
        log.error('Error downloading file from ${url}', error)
      })
  })

  ipcMain.on('show-item-in-folder', (_event, fileName) => {
    shell.showItemInFolder(fileName)
  })

  ipcMain.on('pls-set-my-file-path', (event, filePath) => {
    setFilePathForWindowWithId(event.sender.getOwnerBrowserWindow().id, filePath)
  })

  ipcMain.on('pls-open-login-popup', () => {
    openLoginPopupWindow()
  })

  ipcMain.on('rm-rf', (event, path, messageId) => {
    try {
      fs.rmdirSync(path, { recursive: true })
      event.sender.send(`rm-rf-reply-${messageId}`, null)
    } catch (error) {
      log.error('Error deleting a file via rm-rf: ', path, error)
      event.sender.send(`rm-rf-reply-${messageId}`, error.message || `Error deleting ${path}`)
    }
  })

  ipcMain.on('notify', (event, title, body) => {
    try {
      const notification = new Notification({
        title,
        body,
        silent: true,
      })
      notification.show()
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      // ignore
      // on windows you need something called an Application User Model ID which may not work
    }
  })
}

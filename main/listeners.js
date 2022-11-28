import electron, { shell, Notification, dialog } from 'electron'
import currentSettings, { saveAppSetting } from './modules/settings'
import { setupI18n } from 'plottr_locales'
import https from 'https'
import fs from 'fs'
import { machineId } from 'node-machine-id'
import { parse } from 'dotenv'

import { helpers } from 'pltr/v2'

import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import { loadMenu } from './modules/menus'
import { getWindowById, numberOfWindows } from './modules/windows'
import { setDarkMode } from './modules/theme'
import { addToKnownFiles } from './modules/known_files'
import {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
  featureFlags,
} from './modules/feature_flags'
import { reloadAllWindows } from './modules/windows'
import { openLoginPopupWindow } from './modules/windows/login'
import { broadcastToAllWindows } from './modules/broadcast'
import {
  openFile,
  createNew,
  createFromSnowflake,
  TEMP_FILES_PATH,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  editKnownFilePath,
  createFromScrivener,
} from './modules/files'
import { editWindowPath, setFilePathForWindowWithId } from './modules/windows/index'
import { lastOpenedFile, setLastOpenedFilePath } from './modules/lastOpened'

const { readFile } = fs.promises

const { app, ipcMain } = electron

export const listenOnIPCMain = (getSocketWorkerPort, processSwitches, safelyExitModule) => {
  ipcMain.on('pls-fetch-state', (event, replyChannel, proMode) => {
    lastOpenedFile()
      .catch((error) => {
        return null
      })
      .then((lastFile) => {
        return currentSettings().then((settings) => {
          // If the user asked for dashboard first, then never reply
          // with the last known file.
          return (settings?.user?.openDashboardFirst && null) || lastFile
        })
      })
      .then((lastFile) => {
        const lastFileURL =
          (lastFile && !helpers.file.isProtocolString(lastFile)
            ? helpers.file.filePathToFileURL(lastFile)
            : lastFile) || null
        const win = getWindowById(event.sender.getOwnerBrowserWindow().id)
        const fileURL = win.fileURL || lastFileURL
        if (win) {
          featureFlags().then((flags) => {
            event.sender.send(
              replyChannel,
              fileURL,
              flags,
              numberOfWindows(),
              win.fileURL,
              processSwitches.serialise()
            )
          })
        }
      })
      .catch((error) => {
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('pls-tell-me-the-socket-worker-port', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, getSocketWorkerPort())
    } catch (error) {
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('pls-set-dark-setting', (event, replyChannel, newValue) => {
    setDarkMode(newValue)
      .then(() => {
        return currentSettings().then((settings) => {
          return broadcastToAllWindows('reload-dark-mode', settings.user.dark)
        })
      })
      .then(() => {
        event.sender.send(replyChannel, newValue)
      })
      .catch((error) => {
        log.error('Failed to set dark mode setting from main listener', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('pls-update-beat-hierarchy-flag', (event, replyChannel, newValue) => {
    try {
      if (newValue) {
        broadcastSetBeatHierarchy()
      } else {
        broadcastUnsetBeatHierarchy()
      }
      event.sender.send(replyChannel, newValue)
    } catch (error) {
      log.error('Error updating the beat hierarchy flag', error)
      event.sender.send(replyChannel, { error: error.mesasge })
    }
  })

  ipcMain.on('pls-update-language', (event, replyChannel, newLanguage) => {
    saveAppSetting('locale', newLanguage)
      .then(() => {
        currentSettings().then((settings) => {
          setupI18n(settings, { electron })
          return loadMenu(safelyExitModule).then(() => {
            reloadAllWindows()
          })
        })
      })
      .then(() => {
        event.sender.send(replyChannel, newLanguage)
      })
      .catch((error) => {
        log.error('Error updating language', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('pls-tell-dashboard-to-reload-recents', (event, replyChannel) => {
    try {
      broadcastToAllWindows('reload-recents')
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('add-to-known-files-and-open', (event, replyChannel, fileURL) => {
    if (!fileURL || fileURL === '') return
    addToKnownFiles(fileURL)
      .then(() => {
        log.info('Adding to known files and opening', fileURL)
        openFile(fileURL, false)
          .then(() => {
            log.info('Opened file', fileURL)
          })
          .catch((error) => {
            log.error('Error opening file and adding to known', fileURL, error)
          })
      })
      .then(() => {
        event.sender.send(replyChannel, fileURL)
      })
      .catch((error) => {
        event.sender.send(replyChannel, { error: error.mesasge })
      })
  })

  ipcMain.on('create-new-file', (event, replyChannel, template, name) => {
    createNew(template, name)
      .then(() => {
        event.sender.send(replyChannel, name)
      })
      .catch((error) => {
        event.sender.send('error', {
          message: error.message,
          source: 'create-new-file',
        })
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('create-from-snowflake', (event, replyChannel, importedPath, isLoggedIntoPro) => {
    createFromSnowflake(importedPath, event.sender, isLoggedIntoPro)
      .then(() => {
        event.sender.send(replyChannel, importedPath)
      })
      .catch((error) => {
        event.sender.send('error', {
          message: error.message,
          source: 'create-new-file',
        })
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on(
    'create-from-scrivener',
    (event, replyChannel, importedPath, isLoggedIntoPro, destinationFile) => {
      createFromScrivener(importedPath, event.sender, isLoggedIntoPro, destinationFile)
        .then(() => {
          event.sender.send(replyChannel, importedPath)
        })
        .catch((error) => {
          event.sender.send('error', {
            message: error.message,
            source: 'create-new-file',
          })
          event.sender.send(replyChannel, { error: error.message })
        })
    }
  )

  ipcMain.on('open-known-file', (event, replyChannel, fileURL, unknown) => {
    log.info('Opening known file', fileURL, unknown)
    openFile(fileURL, unknown)
      .then(() => {
        log.info('Opened file', fileURL)
        event.sender.send(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error('Error opening known file', fileURL, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('remove-from-temp-files-if-temp', (event, replyChannel, fileURL) => {
    if (fileURL.includes(TEMP_FILES_PATH)) {
      removeFromTempFiles(fileURL, false)
        .then(() => {
          event.sender.send(replyChannel, 'done')
        })
        .catch((error) => {
          event.sender.send(replyChannel, { error: error.message })
        })
    } else {
      event.sender.send(replyChannel, 'Not temp')
    }
  })

  ipcMain.on('broadcast-reload-options', () => {
    broadcastToAllWindows('reload-options')
  })

  ipcMain.on('remove-from-known-files', (event, replyChannel, fileURL) => {
    removeFromKnownFiles(fileURL)
      .then(() => {
        event.sender.send(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error(`Error removing file at ${fileURL} from known files`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('delete-known-file', (event, replyChannel, fileURL) => {
    deleteKnownFile(fileURL)
      .then(() => {
        broadcastToAllWindows('reload-recents')
        event.sender.send(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error(`Failed to delete known file at: ${fileURL}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('edit-known-file-path', (event, replyChannel, oldFileURL, newFileURL) => {
    editKnownFilePath(oldFileURL, newFileURL)
      .then(() => {
        editWindowPath(oldFileURL, newFileURL)
        broadcastToAllWindows('reload-recents')
        event.sender.send(replyChannel, newFileURL)
      })
      .catch((error) => {
        log.error(`Failed to edit known file path of ${oldFileURL} to ${newFileURL}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('pls-quit', (event, replyChannel) => {
    try {
      safelyExitModule.quitWhenDone()
      event.sender.send(replyChannel, 'will-exit-when-ready')
    } catch (error) {
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('tell-me-what-os-i-am-on', (event, replyChannel) => {
    try {
      event.sender.send(
        replyChannel,
        is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null
      )
    } catch (error) {
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('download-file-and-show', (event, replyChannel, url) => {
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
              shell.showItemInFolder(fullPath).then(() => {
                event.sender.send(replyChannel, url)
              })
            }
          })
        })
      })
      .on('error', (error) => {
        log.error(`Error downloading file from ${url}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('show-item-in-folder', (event, replyChannel, fileURL) => {
    try {
      shell.showItemInFolder(helpers.file.withoutProtocol(fileURL))
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      log.error(`Failed to show file at ${fileURL}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('pls-set-my-file-path', (event, replyChannel, fileURL) => {
    try {
      setFilePathForWindowWithId(event.sender.getOwnerBrowserWindow().id, fileURL)
      event.sender.send(replyChannel, fileURL)
    } catch (error) {
      log.error(`Failed to set my file path to: ${fileURL}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('pls-open-login-popup', (event, replyChannel) => {
    try {
      openLoginPopupWindow()
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('notify', (event, replyChannel, title, body) => {
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
      event.sender.send(replyChannel, title, body)
    } catch (error) {
      // ignore
      // on windows you need something called an Application User Model ID which may not work
      log.error(`Failed to notify ${title}, ${body}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })
  ipcMain.on('update-last-opened-file', (event, replyChannel, newFileURL) => {
    setLastOpenedFilePath(newFileURL)
      .then(() => {
        event.sender.send(replyChannel, newFileURL)
      })
      .catch((error) => {
        log.error(`Failed to update last opened file to: ${newFileURL}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('log-info', (_event, ...args) => {
    log.info(...args)
  })

  ipcMain.on('log-warn', (_event, ...args) => {
    log.warn(...args)
  })

  ipcMain.on('log-error', (_event, ...args) => {
    log.error(...args)
  })

  ipcMain.on('please-tell-me-my-version', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, app.getVersion())
    } catch (error) {
      log.error(`Failed to get the app version`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('please-tell-me-what-platform-i-am-on', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, process.platform)
    } catch (error) {
      log.error(`Failed to determine what platform we're on`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('machine-id', (event, replyChannel) => {
    machineId()
      .then((id) => {
        event.sender.send(replyChannel, id)
      })
      .catch((error) => {
        log.error('Failed to determine the machine id', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('get-locale', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, app.getLocale())
    } catch (error) {
      log.error('Failed to get machine locale', error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('get-env-object', (event, replyChannel) => {
    readFile(path.resolve(__dirname, '..', '.env'))
      .then((rawEnvFile) => {
        event.sender.send(replyChannel, parse(rawEnvFile))
      })
      .catch((error) => {
        log.error('Failed to get the env object', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('show-error-box', (event, replyChannel, title, message) => {
    dialog
      .showErrorBox(title, message)
      .then(() => {
        event.sender.send(replyChannel, 'done')
      })
      .catch((error) => {
        log.error(`Error showing error box for ${title}, ${message}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('set-window-title', (event, replyChannel, newTitle) => {
    try {
      event.sender.getOwnerBrowserWindow().setTitle(newTitle)
      event.sender.send(replyChannel, newTitle)
    } catch (error) {
      log.error(`Error trying to set my window title to ${newTitle}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('set-represented-file-name', (event, replyChannel, newFileName) => {
    try {
      event.sender.getOwnerBrowserWindow().setRepresentedFilename(newFileName)
      event.sender.send(replyChannel, newFileName)
    } catch (error) {
      log.error(`Error setting the represented file name to ${newFileName}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('show-save-dialog', (event, replyChannel, filters, title, defaultPath) => {
    dialog
      .showSaveDialog(event.sender.getOwnerBrowserWindow(), {
        filters,
        title,
        defaultPath,
      })
      .then(() => {
        event.sender.send(replyChannel, 'done')
      })
      .catch((error) => {
        log.error(`Error showing save dialog for ${title}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('show-message-box', (event, replyChannel, title, message, type, detail) => {
    dialog
      .showMessageBox(event.sender.getOwnerBrowserWindow(), {
        title,
        message,
        type,
        detail,
      })
      .then(() => {
        event.sender.send(replyChannel, 'done')
      })
      .catch((error) => {
        log.error(`Error showing message box for ${title}, ${message}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('set-file-url', (event, replyChannel, fileURL) => {
    try {
      event.sender.getOwnerBrowserWindow().fileURL = fileURL
      event.sender.send(replyChannel, fileURL)
    } catch (error) {
      log.error(`Error setting my fileURL to ${fileURL}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('user-data-path', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, app.getPath('userData'))
    } catch (error) {
      log.error(`Error getting the user data path`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('user-documents-path', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, app.getPath('documents'))
    } catch (error) {
      log.error('Error getting the user documents path', error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('user-logs-path', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, app.getPath('logs'))
    } catch (error) {
      log.error('Error getting the user logs path', error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('show-open-dialog', (event, replyChannel, title, filters, properties) => {
    dialog
      .showOpenDialog(event.sender.getOwnerBrowserWindow(), {
        title,
        filters,
        properties,
      })
      .then(() => {
        event.sender.send(replyChannel, 'done')
      })
      .catch((error) => {
        log.error(`Error showing the open dialog for ${title}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('open-external', (event, replyChannel, url) => {
    try {
      shell.openExternal(url)
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      log.error(`Error opening external ${url}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('open-path', (event, replyChannel, path) => {
    shell
      .open(path)
      .then(() => {
        event.sender.send(replyChannel, path)
      })
      .catch((error) => {
        log.error(`Error opening path: ${path}`, error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })
}

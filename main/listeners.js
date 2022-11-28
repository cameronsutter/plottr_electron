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
  })

  ipcMain.on('pls-tell-me-the-socket-worker-port', (event, replyChannel) => {
    event.sender.send(replyChannel, getSocketWorkerPort())
  })

  ipcMain.on('pls-set-dark-setting', (event, replyChannel, newValue) => {
    setDarkMode(newValue)
      .then(() => {
        return currentSettings().then((settings) => {
          return broadcastToAllWindows('reload-dark-mode', settings.user.dark)
        })
      })
      .catch((error) => {
        log.error('Failed to set dark mode setting from main listener', error)
      })
      .finally(() => {
        event.sender.send(replyChannel, newValue)
      })
  })

  ipcMain.on('pls-update-beat-hierarchy-flag', (event, replyChannel, newValue) => {
    if (newValue) {
      broadcastSetBeatHierarchy()
    } else {
      broadcastUnsetBeatHierarchy()
    }
    event.sender.send(replyChannel, newValue)
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
      .catch((error) => {
        log.error('Error updating language', error)
      })
      .finally(() => {
        event.sender.send(replyChannel, newLanguage)
      })
  })

  ipcMain.on('pls-tell-dashboard-to-reload-recents', (event, replyChannel) => {
    broadcastToAllWindows('reload-recents')
    event.sender.send(replyChannel, 'done')
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
      .finally(() => {
        event.sender.send(replyChannel, fileURL)
      })
  })

  ipcMain.on('create-new-file', (event, replyChannel, template, name) => {
    createNew(template, name)
      .catch((error) => {
        event.sender.send('error', {
          message: error.message,
          source: 'create-new-file',
        })
      })
      .finally(() => {
        event.sender.send(replyChannel, name)
      })
  })

  ipcMain.on('create-from-snowflake', (event, replyChannel, importedPath, isLoggedIntoPro) => {
    createFromSnowflake(importedPath, event.sender, isLoggedIntoPro)
      .catch((error) => {
        event.sender.send('error', {
          message: error.message,
          source: 'create-new-file',
        })
      })
      .finally(() => {
        event.sender.send(replyChannel, importedPath)
      })
  })

  ipcMain.on(
    'create-from-scrivener',
    (event, replyChannel, importedPath, isLoggedIntoPro, destinationFile) => {
      createFromScrivener(importedPath, event.sender, isLoggedIntoPro, destinationFile)
        .catch((error) => {
          event.sender.send('error', {
            message: error.message,
            source: 'create-new-file',
          })
        })
        .then(() => {
          event.sender.send(replyChannel, importedPath)
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
        event.sender.send(replyChannel, `Failed ${error.message}`)
      })
  })

  ipcMain.on('remove-from-temp-files-if-temp', (event, replyChannel, fileURL) => {
    if (fileURL.includes(TEMP_FILES_PATH)) {
      removeFromTempFiles(fileURL, false).then(() => {
        event.sender.send(replyChannel, 'done')
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
      .catch((error) => {
        log.error(`Error removing file at ${fileURL} from known files`, error)
      })
      .finally(() => {
        event.sender.send(replyChannel, fileURL)
      })
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('delete-known-file', (event, replyChannel, fileURL) => {
    deleteKnownFile(fileURL)
      .then(() => {
        broadcastToAllWindows('reload-recents')
      })
      .catch((error) => {
        log.error(`Failed to delete known file at: ${fileURL}`, error)
      })
      .finally(() => {
        event.sender.send(replyChannel, fileURL)
      })
  })

  ipcMain.on('edit-known-file-path', (event, replyChannel, oldFileURL, newFileURL) => {
    editKnownFilePath(oldFileURL, newFileURL).then(() => {
      editWindowPath(oldFileURL, newFileURL)
      broadcastToAllWindows('reload-recents')
      event.sender.send(replyChannel, newFileURL)
    })
  })

  ipcMain.on('pls-quit', (event, replyChannel) => {
    safelyExitModule.quitWhenDone()
    event.sender.send(replyChannel, 'will-exit-when-ready')
  })

  ipcMain.on('tell-me-what-os-i-am-on', (event, replyChannel) => {
    event.sender.send(
      replyChannel,
      is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null
    )
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
        event.sender.send(replyChannel, url)
      })
  })

  ipcMain.on('show-item-in-folder', (event, replyChannel, fileURL) => {
    shell.showItemInFolder(helpers.file.withoutProtocol(fileURL))
    event.sender.send(replyChannel, 'done')
  })

  ipcMain.on('pls-set-my-file-path', (event, replyChannel, fileURL) => {
    setFilePathForWindowWithId(event.sender.getOwnerBrowserWindow().id, fileURL)
    event.sender.send(replyChannel, fileURL)
  })

  ipcMain.on('pls-open-login-popup', (event, replyChannel) => {
    try {
      openLoginPopupWindow()
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      event.sender.send(replyChannel, 'failed')
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
    } catch (error) {
      // ignore
      // on windows you need something called an Application User Model ID which may not work
    } finally {
      event.sender.send(replyChannel, title, body)
    }
  })
  ipcMain.on('update-last-opened-file', (event, replyChannel, newFileURL) => {
    setLastOpenedFilePath(newFileURL).then(() => {
      event.sender.send(replyChannel, newFileURL)
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
    event.sender.send(replyChannel, app.getVersion())
  })

  ipcMain.on('please-tell-me-what-platform-i-am-on', (event, replyChannel) => {
    event.sender.send(replyChannel, process.platform)
  })

  ipcMain.on('machine-id', (event, replyChannel) => {
    machineId().then((id) => {
      event.sender.send(replyChannel, id)
    })
  })

  ipcMain.on('get-locale', (event, replyChannel) => {
    event.sender.send(replyChannel, app.getLocale())
  })

  ipcMain.on('get-env-object', (event, replyChannel) => {
    readFile(path.resolve(__dirname, '..', '.env')).then((rawEnvFile) => {
      event.sender.send(replyChannel, parse(rawEnvFile))
    })
  })

  ipcMain.on('show-error-box', (event, replyChannel, title, message) => {
    dialog.showErrorBox(title, message).then(() => {
      event.sender.send(replyChannel, 'done')
    })
  })

  ipcMain.on('set-window-title', (event, replyChannel, newTitle) => {
    event.sender.getOwnerBrowserWindow().setTitle(newTitle)
    event.sender.send(replyChannel, newTitle)
  })

  ipcMain.on('set-represented-file-name', (event, replyChannel, newFileName) => {
    event.sender.getOwnerBrowserWindow().setRepresentedFilename(newFileName)
    event.sender.send(replyChannel, newFileName)
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
  })

  ipcMain.on('set-file-url', (event, replyChannel, fileURL) => {
    event.sender.getOwnerBrowserWindow().fileURL = fileURL
    event.sender.send(replyChannel, fileURL)
  })

  ipcMain.on('user-data-path', (event, replyChannel) => {
    event.sender.send(replyChannel, app.getPath('userData'))
  })

  ipcMain.on('user-documents-path', (event, replyChannel) => {
    event.sender.send(replyChannel, app.getPath('documents'))
  })

  ipcMain.on('user-logs-path', (event, replyChannel) => {
    event.sender.send(replyChannel, app.getPath('logs'))
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
  })

  ipcMain.on('open-external', (event, replyChannel, url) => {
    shell.openExternal(url)
    event.sender.send(replyChannel, 'done')
  })

  ipcMain.on('open-path', (event, replyChannel, path) => {
    shell
      .open(path)
      .catch((error) => {
        log.error(`Error opening path: ${path}`, error)
      })
      .finally(() => {
        event.sender.send(replyChannel, path)
      })
  })
}

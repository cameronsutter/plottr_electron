import electron, { shell, Notification, dialog } from 'electron'
import currentSettings, { saveAppSetting } from './modules/settings'
import { setupI18n } from 'plottr_locales'
import https from 'https'
import fs from 'fs'
import { machineId } from 'node-machine-id'
import { parse } from 'dotenv'
import { v4 as uuid } from 'uuid'

import { helpers } from 'pltr/v2'
import { askToExport } from 'plottr_import_export'
import { t } from 'plottr_locales'

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
import { whenClientIsReady } from '../shared/socket-client/index'

const { readFile } = fs.promises

const { app, ipcMain } = electron

const ask = (sender, channel, ...args) => {
  const listenToken = `${channel}-${uuid()}`
  // Maybe add a timeout?
  return new Promise((resolve, reject) => {
    try {
      const listener = (event, ...args) => {
        ipcMain.removeListener(listenToken, listener)
        if (args[0] && args[0].error) {
          reject(new Error(args[0].error))
        } else if (args.length === 1) {
          resolve(args[0])
        } else {
          resolve(args)
        }
      }
      ipcMain.on(listenToken, listener)
      sender.send(channel, listenToken, ...args)
    } catch (error) {
      reject(error)
    }
  })
}

const makeDownloadStorageImage = (sender) => (url, fileId, userId) => {
  return ask(sender, 'download-storage-image', url, fileId, userId)
}

const makeMPQ = (sender) => {
  return {
    push: (...args) => {
      sender.send('mpq', ...args)
    },
  }
}

function saveDialog(windowId, filters, title, defaultPath) {
  return dialog.showSaveDialog(windowId, {
    filters,
    title,
    defaultPath,
  })
}

const makeSaveDialog = (sender) => {
  return (filters, title, defaultPath) => {
    return saveDialog(sender.getOwnerBrowserWindow().id, filters, title, defaultPath).then(
      (result) => {
        return result.filePath
      }
    )
  }
}

function showNotification(title, body) {
  const notification = new Notification({
    title,
    body,
    silent: true,
  })
  notification.show()
  setTimeout(() => {
    notification.close()
  }, 5000)
}

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  showNotification(t('File Exported'), messageForType[type])
  shell.showItemInFolder(exportPath)
}

// NOTE: restartServerRef contains a mutable reference to the function
// to call to restart the server.  That function gets updated by
// itself when it's called
export const listenOnIPCMain = (
  getSocketWorkerPort,
  processSwitches,
  safelyExitModule,
  restartServerRef
) => {
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
        log.error('Error fetching state', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })

  ipcMain.on('pls-tell-me-the-socket-worker-port', (event, replyChannel) => {
    try {
      event.sender.send(replyChannel, getSocketWorkerPort())
    } catch (error) {
      log.error('Error retrieving the current worker socket port', error)
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
          setupI18n(settings, { locale: electron.app.getLocale() })
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
      log.error('Error reloading recents', error)
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
        log.error(`Error adding ${fileURL} to known files and opening it`, error)
        event.sender.send(replyChannel, { error: error.mesasge })
      })
  })

  ipcMain.on('create-new-file', (event, replyChannel, template, name) => {
    createNew(template, name)
      .then(() => {
        event.sender.send(replyChannel, name)
      })
      .catch((error) => {
        log.error('Error creating new file', error)
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
        log.error(`Error creating from snowflake (${importedPath})`, error)
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
          log.error(`Error creating from scrivener (${importedPath}, ${destinationFile})`, error)
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
          log.error(`Error removing ${fileURL} from temp files`, error)
          event.sender.send(replyChannel, { error: error.message })
        })
    } else {
      event.sender.send(replyChannel, 'Not temp')
    }
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
      log.error('Error while attempting to quit Plottr', error)
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
      log.error('Error while figuring out what OS we are running', error)
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
              shell.showItemInFolder(fullPath)
              event.sender.send(replyChannel, url)
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
      log.error('Error while trying to start the login popup', error)
      event.sender.send(replyChannel, { error: error.message })
    }
  })

  ipcMain.on('notify', (event, replyChannel, title, body) => {
    try {
      showNotification(title, body)
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
    try {
      dialog.showErrorBox(title, message)
      event.sender.send(replyChannel, 'done')
    } catch (error) {
      log.error(`Error showing error box for ${title}, ${message}`, error)
      event.sender.send(replyChannel, { error: error.message })
    }
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
    saveDialog(event.sender.getOwnerBrowserWindow(), filters, title, defaultPath)
      .then((files) => {
        event.sender.send(replyChannel, files.filePath)
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
      setFilePathForWindowWithId(event.sender.getOwnerBrowserWindow().id, fileURL)
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
      .then((files) => {
        event.sender.send(replyChannel, files.filePaths)
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

  ipcMain.on('export', (event, replyChannel, defaultPath, fullState, type, options, userId) => {
    whenClientIsReady(({ rmRf, writeFile, join, stat, mkdir, basename }) => {
      return askToExport(
        defaultPath,
        fullState,
        type,
        options,
        is.windows,
        notifyUser,
        log,
        makeSaveDialog(event.sender),
        makeMPQ(event.sender),
        rmRf,
        userId,
        makeDownloadStorageImage(event.sender),
        writeFile,
        join,
        stat,
        mkdir,
        basename,
        (error, success) => {
          if (error) {
            event.sender.send(replyChannel, { error: error.message })
            return
          }
          event.sender.send(replyChannel, defaultPath)
        }
      )
    })
  })

  ipcMain.on('restart-server', (event, replyChannel) => {
    log.warn('Restarting the socket server after request by client to do so')
    restartServerRef
      .restartServer()
      .then(() => {
        log.info('Restarted the socket server as per client request')
        event.sender.send(replyChannel, 'done')
      })
      .catch((error) => {
        log.error('Error restarting the socket server', error)
        event.sender.send(replyChannel, { error: error.message })
      })
  })
}

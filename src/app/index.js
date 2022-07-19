// Uncomment this to get helpful debug logs in the console re. what's
// causing re-renders! :)
//
// import React from 'react'
// if (process.env.NODE_ENV === 'development') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//   })
// }

import electron, { ipcRenderer } from 'electron'
import { setupI18n, t } from 'plottr_locales'
import { dialog, getCurrentWindow } from '@electron/remote'

import path from 'path'
import { store } from 'store'

import { actions, selectors, SYSTEM_REDUCER_KEYS } from 'pltr/v2'

import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'
import { convertHTMLNodeList } from 'pltr/v2/slate_serializers/from_html'
import { askToExport } from 'plottr_import_export'
import exportConfig from 'plottr_import_export/src/exporter/default_config'
import world from 'world-api'

import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import { ActionCreators } from 'redux-undo'
import { addNewCustomTemplate } from '../common/utils/custom_templates'
import { createFullErrorReport } from '../common/utils/full_error_report'
import {
  openDashboard,
  closeDashboard,
  createBlankProj,
  createFromTemplate,
  openExistingProj,
} from '../dashboard-events'
import { makeFileSystemAPIs } from '../api'
import { renderFile } from '../renderFile'
import { setOS, isWindows } from '../isOS'
import { uploadToFirebase } from '../upload-to-firebase'
import { openFile, rmRF } from 'connected-components'
import { notifyUser } from '../notifyUser'
import { exportSaveDialog } from '../export-save-dialog'
import { instrumentLongRunningTasks } from './longRunning'
import { rootComponent } from './rootComponent'
import { makeFileModule } from './files'
import { createClient, getPort, whenClientIsReady, setPort } from '../../shared/socket-client'
import logger from '../../shared/logger'

const win = getCurrentWindow()
const osIAmOn = ipcRenderer.sendSync('tell-me-what-os-i-am-on')
setOS(osIAmOn)
const socketWorkerPort = ipcRenderer.sendSync('pls-tell-me-the-socket-worker-port')
setPort(socketWorkerPort)

let rollbar
setupRollbar('app.html').then((newRollbar) => {
  rollbar = newRollbar
})

const socketServerEventHandlers = {
  onSaveBackupError: (filePath, errorMessage) => {
    logger.warn('[file save backup]', errorMessage)
    rollbar.error({ message: 'BACKUP failed' })
    rollbar.warn(errorMessage, { fileName: filePath })
  },
  onSaveBackupSuccess: (filePath) => {
    logger.info('[file save backup]', 'success', filePath)
  },
  onAutoSaveError: (filePath, errorMessage) => {
    logger.warn(errorMessage)
    rollbar.warn(errorMessage, { fileName: filePath })
    dialog.showErrorBox(
      t('Auto-saving failed'),
      t("Saving your file didn't work. Check where it's stored.")
    )
  },
  onAutoSaveWorkedThisTime: () => {
    dialog.showMessageBox(win, {
      title: t('Auto-saving worked'),
      message: t('Saving worked this time 🎉'),
    })
  },
  onAutoSaveBackupError: (backupFilePath, backupErrorMessage) => {
    logger.warn('[save state backup]', backupErrorMessage)
    rollbar.error({ message: 'BACKUP failed' })
    rollbar.warn(backupErrorMessage, { fileName: backupFilePath })
  },
}

createClient(
  getPort(),
  logger,
  (error) => {
    logger.error(
      `Failed to reconnect to socket server on port: <${getPort()}>.  Killing the window.`,
      error
    )
    dialog.showErrorBox(
      t('Error'),
      t("Plottr ran into a problem and can't start.  Please contact support.")
    )
    window.close()
  },
  socketServerEventHandlers
)

const { saveFile, isTempFile } = makeFileModule(whenClientIsReady)

const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
fileSystemAPIs.currentAppSettings().then((settings) => {
  setupI18n(settings, { electron })
})

instrumentLongRunningTasks()

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

process.on('uncaughtException', (err) => {
  logger.error(err)
  rollbar.error(err)
})

// Secondary SETUP //
window.requestIdleCallback(() => {
  whenClientIsReady(({ ensureBackupFullPath, ensureBackupTodayPath, attemptToFetchTemplates }) => {
    return ensureBackupFullPath().then(ensureBackupTodayPath).then(attemptToFetchTemplates)
  })
  initMixpanel()
})

// TODO: fix this by exporting store from the configureStore file
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

ipcRenderer.on('set-beat-hierarchy', (event) => {
  store.dispatch(actions.featureFlags.setBeatHierarchy())
})

ipcRenderer.on('unset-beat-hierarchy', (event) => {
  store.dispatch(actions.featureFlags.unsetBeatHierarchy())
})

ipcRenderer.on('save-custom-template', (event, options) => {
  const currentState = store.getState()
  addNewCustomTemplate(currentState.present, options)
})

ipcRenderer.on('export-file-from-menu', (event, { type }) => {
  const currentState = store.getState()
  const {
    ui,
    series: { name },
    books,
  } = currentState.present
  const bookId = ui.currentTimeline
  const defaultPath =
    bookId == 'series' ? name + ' ' + t('(Series View)') : books[`${bookId}`].title

  askToExport(
    defaultPath,
    currentState.present,
    type,
    exportConfig[type],
    isWindows(),
    notifyUser,
    logger,
    exportSaveDialog,
    MPQ,
    rmRF,
    (error, success) => {
      if (error) {
        logger.error(error)
        dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        return
      }
    }
  )
})

ipcRenderer.on('save', () => {
  const { present } = store.getState()
  saveFile(present.file.fileName, present)
})

ipcRenderer.on('save-as', () => {
  const { present } = store.getState()
  const defaultPath = path.basename(present.file.fileName).replace('.pltr', '')
  const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
  const fileName = dialog.showSaveDialogSync(win, {
    filters,
    title: t('Where would you like to save this copy?'),
    defaultPath,
  })
  if (fileName) {
    let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
    saveFile(newFilePath, present)
    const listener = (event, fileSaved) => {
      if (fileSaved === newFilePath) {
        ipcRenderer.send('pls-open-window', newFilePath, true)
        ipcRenderer.removeListener('file-saved', listener)
      }
    }
    ipcRenderer.on('file-saved', listener)
  }
})

const ensureEndsInPltr = (filePath) => {
  if (!filePath.endsWith('.pltr')) {
    return `${filePath}.pltr`
  }
  return filePath
}

ipcRenderer.on('move-from-temp', () => {
  const { present } = store.getState()
  isTempFile(present).then((isTemp) => {
    if (!isTemp) {
      saveFile(present.file.fileName, present)
      return
    }
    const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
    const newFilePath = ensureEndsInPltr(
      dialog.showSaveDialogSync(win, {
        filters: filters,
        title: t('Where would you like to save this file?'),
      })
    )
    if (newFilePath) {
      // change in redux
      store.dispatch(actions.ui.editFileName(newFilePath))
      // remove from tmp store
      ipcRenderer.send('remove-from-temp-files-if-temp', present.file.fileName)
      // update in known files
      ipcRenderer.send('edit-known-file-path', present.file.fileName, newFilePath)
      // change the window's title
      win.setRepresentedFilename(newFilePath)
      win.filePath = newFilePath
      // send event to dashboard
      ipcRenderer.send('pls-tell-dashboard-to-reload-recents')
    }
  })
})

ipcRenderer.on('undo', (event) => {
  store.dispatch(ActionCreators.undo())
})

ipcRenderer.on('redo', (event) => {
  store.dispatch(ActionCreators.redo())
})

window.onerror = function (message, file, line, column, err) {
  logger.error(err)
  rollbar.error(err)
}

window.SCROLLWITHKEYS = true
document.addEventListener('keydown', (e) => {
  if (window.SCROLLWITHKEYS) {
    const table = document.querySelector('.sticky-table')
    if (table) {
      if (e.key === 'ArrowUp') {
        let amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop -= amount
      } else if (e.key === 'ArrowRight') {
        let amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft += amount
      } else if (e.key === 'ArrowDown') {
        let amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop += amount
      } else if (e.key === 'ArrowLeft') {
        let amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft -= amount
      }
    }
  }
})

window.logger = function (which) {
  process.env.LOGGER = which.toString()
}

ipcRenderer.once('send-launch', (event, version) => {
  fileSystemAPIs.currentAppSettings().then((settings) => {
    const settingsWeCareAbout = {
      auto_download: settings.user?.autoDownloadUpdate,
      backup_on: settings.backup,
      locale: settings.locale,
      dark: settings.user?.dark,
    }
    MPQ.push('Launch', { online: navigator.onLine, version: version, ...settingsWeCareAbout })
  })
})

ipcRenderer.on('create-error-report', () => {
  createFullErrorReport()
})

ipcRenderer.on('close-dashboard', () => {
  closeDashboard()
})

ipcRenderer.on('create-plottr-cloud-file', (event, json, fileName, isScrivenerFile) => {
  const state = store.getState().present
  const emailAddress = selectors.emailAddressSelector(state)
  const userId = selectors.userIdSelector(state)
  uploadToFirebase(emailAddress, userId, json, fileName)
    .then((response) => {
      const fileId = response.data.fileId
      openFile(`plottr://${fileId}`, fileId, false)

      if (isScrivenerFile) {
        store.dispatch(actions.applicationState.finishScrivenerImporter())
      }

      closeDashboard()
      return fileId
    })
    .catch((error) => {
      ipcRenderer.send('error-importing-scrivener', error)
    })
})

ipcRenderer.on('finish-creating-local-scrivener-imported-file', () => {
  store.dispatch(actions.applicationState.finishScrivenerImporter())
})

ipcRenderer.on('error-importing-scrivener', (event, error) => {
  logger.warn('[scrivener import]', error)
  rollbar.warn({ message: error })
  store.dispatch(actions.applicationState.finishScrivenerImporter())
  dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
})

ipcRenderer.on('convert-rtf-string-to-slate', (event, rtfString, conversionId) => {
  rtfToHTML(rtfString).then((html) => {
    ipcRenderer.send(conversionId, convertHTMLNodeList(html))
  })
})

const reloadMenu = () => ipcRenderer.send('pls-reload-menu')
window.addEventListener('load', reloadMenu)
window.addEventListener('focus', reloadMenu)

ipcRenderer.on('new-project', () => createBlankProj())
ipcRenderer.on('open-existing', () => openExistingProj())
ipcRenderer.on('from-template', () => {
  openDashboard()
  setTimeout(createFromTemplate, 300)
})

ipcRenderer.on('error', (event, { message, source }) => {
  logger.error(`Error reported via IPC from <${source}> with message: ${message}`)
  store.dispatch(actions.error.saveTempFileError(message))
})

ipcRenderer.on('update-worker-port', (_event, newPort) => {
  const socketWorkerPort = ipcRenderer.sendSync('pls-tell-me-the-socket-worker-port')
  logger.info(`Updating the socket server port to: ${newPort}`)
  setPort(socketWorkerPort)
  createClient(
    getPort(),
    logger,
    (error) => {
      logger.error(
        `Failed to reconnect to socket server on port: <${newPort}>.  Killing the window.`,
        error
      )
      dialog.showErrorBox(
        t('Error'),
        t('Plottr ran into a problem and needs to close.  Please contact support.')
      )
      window.close()
    },
    socketServerEventHandlers
  )
})

ipcRenderer.on('reload-dark-mode', (_event, newValue) => {
  fileSystemAPIs.saveAppSetting('user.dark', newValue).catch((error) => {
    logger.error(`Failed to set user.dark to ${newValue}`, error)
  })
  store.dispatch(actions.settings.setDarkMode(newValue))
})

ipcRenderer.on('reload-with-new-font', (_event, newValue) => {
  fileSystemAPIs.saveAppSetting('user.font', newValue)
  store.dispatch(actions.settings.setFontSettings({ font: newValue }))
})

ipcRenderer.on('reload-with-new-font-size', (_event, newValue) => {
  fileSystemAPIs.saveAppSetting('user.fontSize', newValue)
  store.dispatch(actions.settings.setFontSettings({ fontSize: newValue }))
})

ipcRenderer.on('import-scrivener-file', (_event, sourceFile, destinationFile) => {
  logger.info(`Received instruction to import from ${sourceFile} to ${destinationFile}`)
  ipcRenderer.send('create-from-scrivener', sourceFile, false, destinationFile)
})

// TODO: not sure when/whether we should unsubscribe.  Presumably
// when the window is refreshed/closed?
//
// Could be important to do so because it might set up inotify
// listeners and too many of those cause slow-downs.
const _unsubscribeToPublishers = world(whenClientIsReady).publishChangesToStore(store)

const root = rootComponent()

renderFile(root, whenClientIsReady)

ipcRenderer.send('listeners-registered')

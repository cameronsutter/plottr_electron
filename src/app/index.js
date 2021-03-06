import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { t as i18n } from 'plottr_locales'
import App from 'containers/App'
import { store } from 'store/configureStore'
import { ipcRenderer, remote } from 'electron'
const { app, dialog } = remote
const win = remote.getCurrentWindow()
import { actions, migrateIfNeeded } from 'pltr/v2'
import MPQ from '../common/utils/MPQ'
import { ensureBackupTodayPath, saveBackup } from '../common/utils/backup'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import log from 'electron-log'
import Modal from 'react-modal'
import SETTINGS from '../common/utils/settings'
import { ActionCreators } from 'redux-undo'
import ScrivenerExporter from '../common/exporter/scrivener/v2/exporter'
import WordExporter from '../common/exporter/word/exporter'
import editorRegistry from './components/rce/editor-registry'
import { setupI18n } from 'plottr_locales'
import { displayFileName, editKnownFilePath } from '../common/utils/known_files'
import { addNewCustomTemplate } from '../common/utils/custom_templates'
import { saveFile } from '../common/utils/files'
import { removeFromTempFiles } from '../common/utils/temp_files'
import { focusIsEditable } from '../common/utils/undo'

setupI18n(SETTINGS)

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const rollbar = setupRollbar('app.html')

process.on('uncaughtException', (err) => {
  log.error(err)
  rollbar.error(err)
})

ensureBackupTodayPath()

Modal.setAppElement('#react-root')
const root = document.getElementById('react-root')
// TODO: fix this by exporting store from the configureStore file
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

function bootFile(filePath, darkMode, numOpenFiles) {
  initMixpanel()
  win.setTitle(displayFileName(filePath))
  win.setRepresentedFilename(filePath)

  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    saveBackup(filePath, json, (err) => {
      if (err) {
        log.warn('[file open backup]', err)
        rollbar.error({ message: 'BACKUP failed' })
        rollbar.warn(err, { fileName: filePath })
      } else {
        log.info('[file open backup]', 'success', filePath)
      }
    })
    migrateIfNeeded(app.getVersion(), json, filePath, null, (err, didMigrate, state) => {
      if (err) {
        rollbar.error(err)
        log.error(err)
      }
      store.dispatch(actions.ui.loadFile(filePath, didMigrate, state, state.file.version))

      MPQ.projectEventStats(
        'open_file',
        { online: navigator.onLine, version: state.file.version, number_open: numOpenFiles },
        state
      )

      if (state.ui && state.ui.darkMode !== darkMode) {
        store.dispatch(actions.ui.setDarkMode(darkMode))
      }
      if (darkMode) window.document.body.className = 'darkmode'

      render(
        <Provider store={store}>
          <App showTour={false} />
        </Provider>,
        root
      )
    })
  } catch (error) {
    // TODO: error dialog and ask the user to try again
    log.error(error)
    rollbar.error(error)
  }
}

ipcRenderer.send('pls-fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, filePath, darkMode, numOpenFiles) => {
  bootFile(filePath, darkMode, numOpenFiles)
})

ipcRenderer.on('reload-from-file', (event, filePath, darkMode, numOpenFiles) => {
  bootFile(filePath, darkMode, numOpenFiles)
})

ipcRenderer.on('set-dark-mode', (event, isOn) => {
  store.dispatch(actions.ui.setDarkMode(isOn))
  window.document.body.className = isOn ? 'darkmode' : ''
})

ipcRenderer.on('export-file', (event, options) => {
  const currentState = store.getState()
  switch (options.type) {
    case 'scrivener':
      ScrivenerExporter(currentState.present, options.fileName)
      break
    case 'word':
    default:
      WordExporter(currentState.present, options)
      break
  }
})

ipcRenderer.on('save-custom-template', (event, options) => {
  const currentState = store.getState()
  addNewCustomTemplate(currentState.present, options)
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
    title: i18n('Where would you like to save this copy?'),
    defaultPath,
  })
  if (fileName) {
    let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
    saveFile(newFilePath, present)
    ipcRenderer.send('pls-open-window', newFilePath, true)
  }
})

ipcRenderer.on('move-from-temp', () => {
  const { present } = store.getState()
  const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
  const newFilePath = dialog.showSaveDialogSync(win, {
    filters: filters,
    title: i18n('Where would you like to save this file?'),
  })
  if (newFilePath) {
    // change in redux
    store.dispatch(actions.ui.editFileName(newFilePath))
    // remove from tmp store
    removeFromTempFiles(present.file.fileName)
    // update in known files
    editKnownFilePath(present.file.fileName, newFilePath)
    // change the window's title
    win.setRepresentedFilename(newFilePath)
    win.setTitle(displayFileName(newFilePath))
    // send event to dashboard
    ipcRenderer.send('pls-tell-dashboard-to-reload-recents')
  }
})

// for some reason the electron webContents.undo() and redo() don't affect
// the slate editors. So we use the editorRegistry, which can be used to lookup
// editors based on the active dom node, to find the currently active editor and
// issue an undo/redo on the focused slate editor. If a slate editor is not focused
// it won't do anything
ipcRenderer.on('undo', (event) => {
  if (focusIsEditable()) {
    win.webContents.undo()
    const editor = editorRegistry.getEditor(document.activeElement)
    if (editor != null) {
      editor.undo()
    }
  } else {
    // custom undo function
    store.dispatch(ActionCreators.undo())
  }
})

ipcRenderer.on('redo', (event) => {
  if (focusIsEditable()) {
    win.webContents.redo()
    const editor = editorRegistry.getEditor(document.activeElement)
    if (editor != null) {
      editor.redo()
    }
  } else {
    // custom redo function
    store.dispatch(ActionCreators.redo())
  }
})

window.onerror = function (message, file, line, column, err) {
  log.error(err)
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

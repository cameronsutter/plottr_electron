import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import i18n from 'format-message';
import App from 'containers/App'
import configureStore from 'store/configureStore'
import { ipcRenderer, remote } from 'electron'
const { Menu, MenuItem } = remote
const win = remote.getCurrentWindow()
const app = remote.app
// import { actions, migrateIfNeeded } from 'pltr/v2'
import { newFile, fileSaved, loadFile, setDarkMode } from 'actions/ui'
import { MPQ, setTrialInfo } from 'middlewares/helpers'
import { ensureBackupTodayPath, saveBackup } from '../common/utils/backup'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import log from 'electron-log'
import Modal from 'react-modal'
import SETTINGS from '../common/utils/settings'
import { ActionCreators } from 'redux-undo'
import ScrivenerExporter from '../common/exporter/scrivener/v2/exporter'
import WordExporter from '../common/exporter/word/exporter'
import Importer from '../common/importer/snowflake/importer'
import editorRegistry from './components/rce/editor-registry'
import { setupI18n } from '../../locales'
import { focusIsEditable } from './helpers/undo'
import { displayFileName } from '../common/utils/known_files'

setupI18n(SETTINGS)

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const rollbar = setupRollbar('app.html')

process.on('uncaughtException', err => {
  log.error(err)
  rollbar.error(err)
})

initMixpanel()
ensureBackupTodayPath()

Modal.setAppElement('#react-root')
const root = document.getElementById('react-root')
const store = configureStore()
// TODO: fix this by exporting store from the configureStore file
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

function bootFile (filePath, darkMode, numOpenFiles) {
  win.setTitle(displayFileName(filePath))
  win.setRepresentedFilename(filePath)

  try {
    // const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    // migrateIfNeeded(app.getVersion(), json, filePath, null, (err, didMigrate, state) => {
    //   if (err) {
    //     rollbar.error(err)
    //     log.error(err)
    //   }
    //   store.dispatch(actions.uiActions.loadFile(filePath, didMigrate, state, state.file.version))

    //   MPQ.defaultEventStats('open_file', {online: navigator.onLine, version: state.file.version, number_open: numOpenFiles}, state)

    //   const newDarkState = state.ui ? state.ui.darkMode || darkMode : darkMode
    //   if (state.ui && state.ui.darkMode !== darkMode) {
    //     store.dispatch(setDarkMode(newDarkState))
    //   }
    //   if (newDarkState) window.document.body.className = 'darkmode'

    //   render(
    //     <Provider store={store}>
    //       <App showTour={SETTINGS.get('showTheTour')} />
    //     </Provider>,
    //     root
    //   )
    // })
    const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    saveBackup(filePath, state, (err) => {
      if (err) {
        log.warn('[file open backup]', err)
        rollbar.error({message: 'BACKUP failed'})
        rollbar.warn(err, {fileName: filePath})
      } else {
        log.info('[file open backup]', 'success', filePath)
      }
    })
    const didMigrate = false
    store.dispatch(loadFile(filePath, didMigrate, state))

    MPQ.defaultEventStats('open_file', {online: navigator.onLine, version: state.file.version, number_open: numOpenFiles}, state)

    const newDarkState = state.ui ? state.ui.darkMode || darkMode : darkMode
    if (state.ui && state.ui.darkMode !== darkMode) {
      store.dispatch(setDarkMode(newDarkState))
    }
    if (newDarkState) window.document.body.className = 'darkmode'

    render(
      <Provider store={store}>
        <App showTour={SETTINGS.get('showTheTour')} />
      </Provider>,
      root
    )
  } catch (error) {
    // TODO: maybe tell the main process there was en error, and ask the user to try again
    log.error(error)
    rollbar.error(error)
  }
}

ipcRenderer.send('pls-fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, filePath, darkMode, numOpenFiles) => {
  bootFile(filePath, darkMode, numOpenFiles)
})

// ipcRenderer.once('send-launch', (event, version, isTrialMode, daysLeftOfTrial) => {
//   setTrialInfo(isTrialMode, daysLeftOfTrial)
//   MPQ.push('Launch', {online: navigator.onLine, version: version})
//   ipcRenderer.send('launch-sent')
// })

ipcRenderer.on('set-dark-mode', (event, on) => {
  store.dispatch(setDarkMode(on))
  window.document.body.className = on ? 'darkmode' : ''
})

ipcRenderer.on('pls-export', (event, options) => {
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

// TODO: import from dashboard
// ipcRenderer.on('import-snowflake', (event, currentState, fileName, importPath, darkMode, openFiles) => {
//   const result = Importer(importPath, true, currentState)
//   bootFile(result, fileName, true, darkMode, openFiles)
// })

// for some reason the electron webContents.undo() and redo() don't affect
// the slate editors. So we use the editorRegistry, which can be used to lookup
// editors based on the active dom node, to find the currently active editor and
// issue an undo/redo on the focused slate editor. If a slate editor is not focused
// it won't do anything
ipcRenderer.on('undo', (event) => {
  if (focusIsEditable()) {
    win.webContents.undo()
    const editor = editorRegistry.getEditor(document.activeElement);
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
    const editor = editorRegistry.getEditor(document.activeElement);
    if (editor != null) {
      editor.redo();
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
document.addEventListener('keydown', e => {
  if (window.SCROLLWITHKEYS) {
    const table = document.querySelector(".sticky-table")
    if (table) {
      if (e.key === 'ArrowUp') {
        var amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop -= amount
      } else if (e.key === 'ArrowRight') {
        var amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft += amount
      } else if (e.key === 'ArrowDown') {
        var amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop += amount
      } else if (e.key === 'ArrowLeft') {
        var amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft -= amount
      }
    }
  }
})

window.logger = function(which) {
  process.env.LOGGER = which.toString()
}

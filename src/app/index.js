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
import { newFile, fileSaved, loadFile, setDarkMode } from 'actions/ui'
import { MPQ, setTrialInfo } from 'middlewares/helpers'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import log from 'electron-log'
import Modal from 'react-modal'
import SETTINGS from '../common/utils/settings'
import { ActionCreators } from 'redux-undo'
import Exporter from '../common/exporter/scrivener/v2/exporter'
import Importer from '../common/importer/snowflake/importer'
import editorRegistry from './components/rce/editor-registry';
import { setupI18n } from '../../locales';

setupI18n(SETTINGS);

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const rollbar = setupRollbar('app.html')

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', err => {
    log.error(err)
    rollbar.error(err)
  })
}

initMixpanel()

Modal.setAppElement('#react-root')
const root = document.getElementById('react-root')
const store = configureStore()
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

function bootFile (state, fileName, dirty, darkMode, openFiles) {
  store.dispatch(loadFile(fileName, dirty, state))
  MPQ.defaultEventStats('open_file', {online: navigator.onLine, version: state.file.version, number_open: openFiles}, state)

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
}

ipcRenderer.send('fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, state, fileName, dirty, darkMode, openFiles) => {
  bootFile(state, fileName, dirty, darkMode, openFiles)
})

ipcRenderer.once('send-launch', (event, version, isTrialMode, daysLeftOfTrial) => {
  setTrialInfo(isTrialMode, daysLeftOfTrial)
  MPQ.push('Launch', {online: navigator.onLine, version: version})
  ipcRenderer.send('launch-sent')
})

ipcRenderer.on('set-dark-mode', (event, on) => {
  store.dispatch(setDarkMode(on))
  window.document.body.className = on ? 'darkmode' : ''
})

ipcRenderer.on('export-scrivener', (event, filePath) => {
  const currentState = store.getState()
  Exporter(currentState.present, filePath)
})

ipcRenderer.on('import-snowflake', (event, currentState, fileName, importPath, darkMode, openFiles) => {
  const result = Importer(importPath, true, currentState)
  bootFile(result, fileName, true, darkMode, openFiles)
})

function focusIsEditable () {
  if (document.activeElement.tagName == 'INPUT') return true
  if (document.activeElement.dataset.slateEditor
    && document.activeElement.dataset.slateEditor == "true") return true

  return false
}

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
      editor.undo();
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
  if (process.env.NODE_ENV !== 'development') {
    log.error(err)
    rollbar.error(err)
  }
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

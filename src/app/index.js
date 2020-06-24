import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import { ipcRenderer, remote } from 'electron'
const { Menu, MenuItem } = remote
const win = remote.getCurrentWindow()
const app = remote.app
import { newFile, fileSaved, loadFile, setDarkMode } from 'actions/ui'
import mixpanel from 'mixpanel-browser'
import { MPQ, setTrialInfo } from 'middlewares/helpers'
import setupRollbar from '../common/utils/rollbar'
import log from 'electron-log'
import i18n from 'format-message'
import Modal from 'react-modal'
import SETTINGS from '../common/utils/settings'
// import contextMenu from 'electron-context-menu'


i18n.setup({
  translations: require('../../locales'),
  locale: app.getLocale() || 'en'
})

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const rollbar = setupRollbar('app.html')

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', err => {
    log.error(err)
    rollbar.error(err)
  })
}

mixpanel.init('507cb4c0ee35b3bde61db304462e9351')

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

ipcRenderer.send('fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, state, fileName, dirty, darkMode, openFiles) => {
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

window.onerror = function (message, file, line, column, err) {
  if (process.env.NODE_ENV !== 'development') {
    log.error(err)
    rollbar.error(err)
  }
}

window.SCROLLWITHKEYS = true
window.onkeydown = function (e) {
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
}

window.logger = function(which) {
  process.env.LOGGER = which.toString()
}

// https://github.com/sindresorhus/electron-context-menu
// contextMenu({
//   prepend: (defaultActions, params, browserWindow) => []
// })

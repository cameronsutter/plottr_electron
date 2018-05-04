import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import { ipcRenderer, remote, app } from 'electron'
const win = remote.getCurrentWindow()
import { newFile, fileSaved, loadFile, setDarkMode } from 'actions/ui'
import mixpanel from 'mixpanel-browser'
import { MPQ } from 'middlewares/helpers'
import FileFixer from 'helpers/fixer'
import log from 'electron-log'

import i18n from 'format-message'
i18n.setup({
  generateId: require('format-message-generate-id/underscored_crc32'),
  translations: require('../../locales'),
  locale: 'en' || app.getLocale()
})

mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
const root = document.getElementById('react-root')
const store = configureStore()

ipcRenderer.on('state-saved', (_arg) => {
  store.dispatch(fileSaved())
})

ipcRenderer.send('fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, state, fileName, dirty, darkMode, openFiles) => {
  if (state && Object.keys(state).length > 0) {
    store.dispatch(loadFile(fileName, dirty, state))
    MPQ.push('open_file', {online: navigator.onLine, version: state.file.version, number_open: openFiles, new_file: false})
  } else {
    store.dispatch(newFile(fileName))
    MPQ.push('open_file', {online: navigator.onLine, version: app.getVersion(), number_open: openFiles, new_file: true})
  }

  store.dispatch(setDarkMode(darkMode))
  if (darkMode) window.document.body.className = 'darkmode'


  render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  )
})

ipcRenderer.once('send-launch', (event, version) => {
  MPQ.push('Launch', {online: navigator.onLine, version: version})
  ipcRenderer.send('launch-sent')
})

ipcRenderer.on('set-dark-mode', (event, on) => {
  store.dispatch(setDarkMode(on))
  window.document.body.className = on ? 'darkmode' : ''
})

window.onerror = function (message, file, line, column, err) {
  if (process.env.NODE_ENV !== 'dev') {
    log.warn(err)
    rollbar.info(err)
    let newState = FileFixer(store.getState())
    ipcRenderer.send('reload-window', win.id, newState)
  }
}

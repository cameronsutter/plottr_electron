import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import 'style!css!sass!css/app.css.scss'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()
import { newFile, fileSaved, loadFile } from 'actions/ui'
import mixpanel from 'mixpanel-browser'
import { MPQ } from 'middlewares/helpers'

const root = document.getElementById('react-root')
const store = configureStore()

ipcRenderer.on('state-saved', (_arg) => {
  store.dispatch(fileSaved())
})

ipcRenderer.send('fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, state, fileName, dirty) => {
  if (state && Object.keys(state).length > 0) {
    store.dispatch(loadFile(fileName, dirty, state))
  } else {
    store.dispatch(newFile(fileName))
  }

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  )
})

ipcRenderer.once('init-tracker', (event) => {
  mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
  MPQ.push('Launch', {online: navigator.onLine})
  ipcRenderer.send('tracker-initialized')
})

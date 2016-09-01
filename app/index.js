import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import 'style!css!sass!css/app.css.scss'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()
import { newFile, fileSaved } from 'actions/ui'

const root = document.getElementById('react-root')
var store = configureStore()

ipcRenderer.on('state-saved', (_arg) => {
  store.dispatch(fileSaved())
})

ipcRenderer.send('fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, state, fileName) => {
  store = configureStore(state)

  if (!state || state === {} || Object.keys(state).length === 0) {
    store.dispatch(newFile(fileName))
  }

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  )
})

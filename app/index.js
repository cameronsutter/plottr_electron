import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import { saveToLocalStorage, readJSONsync } from 'store/localStorage'
import 'style!css!sass!css/app.css.scss'
import ipc from 'ipc'
import { loadFile, newFile, fileSaved } from 'actions/ui'
// import Modal from 'react-modal'

const root = document.getElementById('react-root')
// Modal.setAppElement(root)

const store = configureStore()

ipc.on('state-saved', (_arg) => {
  store.dispatch(fileSaved())
})

ipc.on('new-file', (fileName) => {
  store.dispatch(newFile(fileName))
})

ipc.on('open-file', (fileName) => {
  saveToLocalStorage(fileName)
  var json = readJSONsync(fileName)
  store.dispatch(loadFile(fileName, json))
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)

import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from 'containers/App'
import configureStore from 'store/configureStore'
import { saveToLocalStorage, readJSONsync } from 'store/localStorage'
import 'style!css!sass!css/app.css.scss'
import fs from 'fs'
import ipc from 'ipc'
import remote from 'remote'
const app = remote.require('app')
const dialog = remote.require('dialog')
const win = remote.getCurrentWindow()
import Migrator from 'migrator/migrator'
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
  var m = new Migrator(json, json.file.version, app.getVersion())
  if (!m.areSameVersion()) {
    if (m.plottrBehindFile()) {
      dialog.showErrorBox('Update Plottr', 'It looks like your file was saved with a newer version of Plottr than you\'re using now. That could cause problems. Try updating Plottr and starting it again.')
    } else {
      // ask user if you want to try to migrate
      dialog.showMessageBox(win, {type: 'question', buttons: ['yes, update the file', 'no, open the file as-is'], defaultId: 0, message: 'It looks like you have an older file version. This could make things work funky or not at all. May Plottr update it for you?', detail: '(It will save a backup first which will be saved to the same folder as this file)'}, (choice) => {
        if (choice === 0) {
          m.migrate((err, json) => {
            if (err === 'backup') {
              dialog.showErrorBox('Problem saving backup', 'Plottr couldn\'t save a backup. It hasn\'t touched your file yet, so don\'t worry. Try quitting Plottr and starting it again.')
            } else {
              // tell the user we've migrated versions and saved a backup file
              fs.saveFile(fileName, json, (err) => {
                if (err) {
                  dialog.showErrorBox('Problem saving updated file', 'Plottr updated your file, but couldn\'t save it for some reason. Your old file is still intact though. Try quitting Plottr and starting it again.')
                } else {
                  dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr updated your file without a problem'})
                  store.dispatch(loadFile(fileName, json))
                }
              })
            }
          })
        } else {
          // open file without migrating
          fs.saveFile(`${fileName}.backup`, json, (err) => {
            if (err) {
              dialog.showErrorBox('Problem saving backup', 'Plottr tried saving a backup just in case, but it didn\'t work. Try quitting Plottr and starting it again.')
            } else {
              dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr saved a backup just in case and now on with the show (To use the backup, remove \'.backup\' from the file name)'})
              store.dispatch(loadFile(fileName, json))
            }
          })
        }
      })
    }
  }
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)

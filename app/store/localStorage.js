import fs from 'fs'
import { ipcRenderer } from 'electron'

export function saveToLocalStorage (fileName) {
  window.localStorage.setItem(localStorageKey(), fileName)
}

export function getFileNameFromLocalStorage () {
  return window.localStorage.getItem(localStorageKey()) || null
}

export function readJSON (fileName, callback, noSuchFileCallback) {
  var json = ''
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
      ipcRenderer.send('error-on-open')
    } else {
      json = JSON.parse(data)
      callback(fileName, json)
    }
  })
}

export function readJSONsync (fileName) {
  var data = fs.readFileSync(fileName, 'utf-8')
  return JSON.parse(data)
}

function localStorageKey () {
  if (process.env.NODE_ENV === 'dev') {
    return 'devRecentFileName'
  } else {
    return 'recentFileName'
  }
}

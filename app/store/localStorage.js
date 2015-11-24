import fs from 'fs'

export function saveToLocalStorage (fileName) {
  window.localStorage.setItem('recentFileName', fileName)
}

export function getFileNameFromLocalStorage () {
  return window.localStorage.getItem('recentFileName') || null
}

export function readJSON (fileName, callback) {
  var json = ''
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) throw err
    json = JSON.parse(data)
    callback(fileName, json)
  })
}

export function readJSONsync (fileName) {
  var data = fs.readFileSync(fileName, 'utf-8')
  return JSON.parse(data)
}

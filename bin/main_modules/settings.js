var storage = require('electron-json-storage')

const SETTINGS_PATH = 'settings'
let fetched = false
let retry = true
let SETTINGS = {
  darkMode: false,
  fullscreen: false
}

function getSettings (callback) {
  if (fetched) return callback(SETTINGS)

  if (retry) {
    setTimeout(() => {
      retry = false
      getSettings(callback)
    }, 300)
  } else {
    return callback(SETTINGS)
  }
}

function updateSettings (vals, callback) {
  SETTINGS = {
    ...SETTINGS,
    ...vals
  }

  storage.set(SETTINGS_PATH, SETTINGS, (err) => {
    callback(SETTINGS)
  })
}


function ensureSettingsFile() {
  storage.has(SETTINGS_PATH, (err, hasKey) => {
    if (err) log.error(err)
    if (hasKey) {
      storage.get(SETTINGS_PATH, (err, data) => {
        if (!err) {
          SETTINGS = data
          fetched = true
        }
      })
    } else {
      storage.set(SETTINGS_PATH, SETTINGS)
      fetched = true
    }
  })
}
ensureSettingsFile()

module.exports = { getSettings, updateSettings }
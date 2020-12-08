const { nativeTheme } = require('electron')
const { windows } = require('./windows')
const { setDarkModeForDashboard } = require('./windows/dashboard')

let darkMode = nativeTheme.shouldUseDarkColors || false

function getDarkMode() {
  return darkMode
}

function setDarkMode(value) {
  darkMode = value
  windows.forEach((winObj) => {
    winObj.browserWindow.webContents.send('set-dark-mode', darkMode)
  })
  setDarkModeForDashboard(darkMode)
}

function toggleDarkMode() {
  setDarkMode(!darkMode)
}

nativeTheme.on('updated', () => setDarkMode(nativeTheme.shouldUseDarkColors))

module.exports = {
  getDarkMode,
  setDarkMode,
  toggleDarkMode,
}

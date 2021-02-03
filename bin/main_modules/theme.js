const { nativeTheme } = require('electron')
const { allWindows } = require('./windows')
const { setDarkModeForDashboard } = require('./windows/dashboard')

let darkMode = nativeTheme.shouldUseDarkColors || false

function getDarkMode() {
  return darkMode
}

function setDarkMode(value) {
  darkMode = value
  allWindows().forEach((winObj) => {
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

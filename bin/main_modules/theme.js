const { nativeTheme } = require('electron');
const { windows } = require('./windows');

let darkMode = nativeTheme.shouldUseDarkColors || false

function getDarkMode() {
  return darkMode;
}

function setDarkMode(value) {
  darkMode = value;
  windows.forEach((window) => {
    window.window.webContents.send('set-dark-mode', darkMode)
  })
}

function toggleDarkMode() {
  setDarkMode(!darkMode);
}

nativeTheme.on('updated', () => setDarkMode(nativeTheme.shouldUseDarkColors));

module.exports = {
  getDarkMode,
  setDarkMode,
  toggleDarkMode,
}

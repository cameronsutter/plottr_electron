const Store = require('electron-store')
const { app } = require('electron')

const LAST_OPENED_NAME =
  process.env.NODE_ENV == 'development' ? 'last_opened_dev.json' : 'last_opened.json'
const lastOpenedFileStore = new Store({
  name: LAST_OPENED_NAME,
  cwd: app.getPath('userData'),
  watch: true,
})

function lastOpenedFile() {
  return lastOpenedFileStore.get('lastOpenedFilePath')
}

function setLastOpenedFilePath(filePath) {
  lastOpenedFileStore.set('lastOpenedFilePath', filePath)
}

module.exports = {
  lastOpenedFile,
  setLastOpenedFilePath,
}

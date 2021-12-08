const { app } = require('electron')
const path = require('path')

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

function escapeFileName(fileName) {
  return escape(fileName.replace(/[/\\]/g, '-'))
}

function offlineFilePath(filePath) {
  const fileName = escapeFileName(filePath)
  return path.join(OFFLINE_FILE_FILES_PATH, fileName)
}

module.exports = {
  offlineFilePath,
  OFFLINE_FILE_FILES_PATH,
}

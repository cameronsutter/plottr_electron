import { app } from 'electron'
import path from 'path'

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

function escapeFileName(fileName) {
  return escape(fileName.replace(/[/\\]/g, '-'))
}

function offlineFilePath(filePath) {
  const fileName = escapeFileName(filePath)
  return path.join(OFFLINE_FILE_FILES_PATH, fileName)
}

function isOfflineFile(filePath) {
  return filePath.startsWith(OFFLINE_FILE_FILES_PATH)
}

export { offlineFilePath, isOfflineFile, OFFLINE_FILE_FILES_PATH }

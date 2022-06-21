import Store from 'electron-store'
import { app } from 'electron'
import { isOfflineFile } from './offlineFilePath'

const LAST_OPENED_NAME = process.env.NODE_ENV == 'development' ? 'last_opened_dev' : 'last_opened'
const lastOpenedFileStore = new Store({
  name: LAST_OPENED_NAME,
  cwd: app.getPath('userData'),
  watch: true,
})

function lastOpenedFile() {
  const lastFile = lastOpenedFileStore.get('lastOpenedFilePath')

  if (isOfflineFile(lastFile)) return null
  return lastFile
}

function setLastOpenedFilePath(filePath) {
  if (isOfflineFile(filePath)) return

  lastOpenedFileStore.set('lastOpenedFilePath', filePath)
}

export { lastOpenedFile, setLastOpenedFilePath }

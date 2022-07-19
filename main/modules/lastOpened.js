import { app } from 'electron'
import log from 'electron-log'

import { isOfflineFile } from './offlineFilePath'
import Store from '../lib/store'

const LAST_OPENED_NAME = process.env.NODE_ENV == 'development' ? 'last_opened_dev' : 'last_opened'
const lastOpenedFileStore = new Store(app.getPath('userData'), log, {
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

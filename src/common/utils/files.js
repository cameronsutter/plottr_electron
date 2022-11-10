import { ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

import { helpers } from 'pltr/v2'

import { makeFileModule } from '../../app/files'
import { whenClientIsReady } from '../../../shared/socket-client'
import { makeMainProcessClient } from '../../app/mainProcessClient'

const { userDataPath } = makeMainProcessClient()

const { readOfflineFiles } = makeFileModule(whenClientIsReady)

export function doesFileExist(fileURL) {
  return fs.existsSync(helpers.file.withoutProtocol(fileURL))
}

export function removeFromKnownFiles(fileURL) {
  ipcRenderer.send('remove-from-known-files', fileURL)
}

export function listOfflineFiles() {
  return readOfflineFiles()
}

export function offlineFileURL(fileURL) {
  return userDataPath().then((userData) => {
    const OFFLINE_FILE_FILES_PATH = path.join(userData, 'offline')
    return helpers.file.filePathToFileURL(
      path.join(OFFLINE_FILE_FILES_PATH, helpers.file.withoutProtocol(fileURL))
    )
  })
}

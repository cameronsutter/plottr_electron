import { ipcRenderer } from 'electron'
import { app } from '@electron/remote'
import fs from 'fs'
import path from 'path'

import { helpers } from 'pltr/v2'

import { makeFileModule } from '../../app/files'
import { whenClientIsReady } from '../../../shared/socket-client'

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

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

export const isOfflineFile = (fileURL) => {
  return helpers.file.withoutProtocol(fileURL).startsWith(OFFLINE_FILE_FILES_PATH)
}

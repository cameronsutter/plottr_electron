import { ipcRenderer } from 'electron'

import { helpers } from 'pltr/v2'

import { makeFileModule } from '../../app/files'
import { whenClientIsReady } from '../../../shared/socket-client'

const { readOfflineFiles } = makeFileModule(whenClientIsReady)

export function doesFileExist(fileURL) {
  return whenClientIsReady(({ fileExists }) => {
    return fileExists(helpers.file.withoutProtocol(fileURL))
  })
}

export function removeFromKnownFiles(fileURL) {
  ipcRenderer.send('remove-from-known-files', fileURL)
}

export function listOfflineFiles() {
  return readOfflineFiles()
}

export function offlineFileURL(fileURL) {
  return whenClientIsReady(({ join, offlineFileBasePath }) => {
    return offlineFileBasePath().then((offlineFileFilesPath) => {
      return join(offlineFileFilesPath, helpers.file.withoutProtocol(fileURL)).then((filePath) => {
        return helpers.file.filePathToFileURL(filePath)
      })
    })
  })
}

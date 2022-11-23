import { helpers } from 'pltr/v2'

import { makeFileModule } from '../../app/files'
import { whenClientIsReady } from '../../../shared/socket-client'
import { makeMainProcessClient } from '../../app/mainProcessClient'

const { readOfflineFiles } = makeFileModule(whenClientIsReady)

const { removeFromKnownFiles } = makeMainProcessClient()

export function doesFileExist(fileURL) {
  return whenClientIsReady(({ fileExists }) => {
    return fileExists(helpers.file.withoutProtocol(fileURL))
  })
}

export { removeFromKnownFiles }

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

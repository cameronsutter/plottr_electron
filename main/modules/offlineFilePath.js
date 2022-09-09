import { app } from 'electron'
import path from 'path'

import { helpers } from 'pltr/v2'

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

// It's only valid to create an offline file from a pro file
function offlineFileURL(fileURL) {
  if (!helpers.file.urlPointsToPlottrCloud(fileURL)) {
    return null
  }

  const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
  return helpers.file.filePathToFileURL(path.join(OFFLINE_FILE_FILES_PATH, fileId))
}

function isOfflineFile(fileURL) {
  return fileURL && helpers.file.withoutProtocol(fileURL).startsWith(OFFLINE_FILE_FILES_PATH)
}

export { offlineFileURL, isOfflineFile, OFFLINE_FILE_FILES_PATH }

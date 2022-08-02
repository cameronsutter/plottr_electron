import { reloadRecents } from './dashboard'
import { OFFLINE_FILE_FILES_PATH } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client/index'

function getKnownFilesInfo() {
  return whenClientIsReady(({ currentKnownFiles }) => {
    return currentKnownFiles()
  })
}

// The difference between `addtoKnown` and `addToKnownFiles` seems to
// be that `addToKnownFiles` does some fixing to broken stores and
// `addToKnown` sets the last opened date.
function addToKnown(filePath) {
  return whenClientIsReady(({ addKnownFile }) => {
    return addKnownFile(filePath).then(() => {
      reloadRecents()
    })
  })
}

function addToKnownFiles(filePath) {
  return whenClientIsReady(({ addKnownFileWithFix }) => {
    return addKnownFileWithFix(filePath)
  })
}

export { getKnownFilesInfo, addToKnown, addToKnownFiles }

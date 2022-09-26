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
function addToKnown(fileURL) {
  return whenClientIsReady(({ addKnownFile }) => {
    return addKnownFile(fileURL).then(() => {
      return reloadRecents()
    })
  })
}

function addToKnownFiles(fileURL) {
  return whenClientIsReady(({ addKnownFileWithFix }) => {
    return addKnownFileWithFix(fileURL).then(() => {
      return reloadRecents()
    })
  })
}

export { getKnownFilesInfo, addToKnown, addToKnownFiles }

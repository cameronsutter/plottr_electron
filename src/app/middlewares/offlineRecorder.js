import { ipcRenderer } from 'electron'

import { selectors } from 'pltr/v2'

const offlineRecorder = (store) => (next) => (action) => {
  const result = next(action)

  const state = store.getState().present
  if (
    selectors.isCloudFileSelector(state) &&
    !selectors.isOfflineSelector(state) &&
    !selectors.isResumingSelector(state)
  ) {
    saveOfflineBackup(state)
  }

  return result
}

let saveTimeout = null
let resetCount = 0
const MAX_RESETS = 200

function saveOfflineBackup(jsonData) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    resetCount++
  }
  const forceSave = () => {
    ipcRenderer.send('record-offline-backup', {
      ...jsonData,
      file: {
        ...jsonData.file,
        originalTimeStamp: jsonData.file.timeStamp,
        originalVersionStamp: jsonData.file.versionStamp,
      },
    })
    resetCount = 0
    saveTimeout = null
  }

  if (resetCount >= MAX_RESETS) {
    forceSave()
    return
  }
  saveTimeout = setTimeout(forceSave, 1000)
}

export default offlineRecorder

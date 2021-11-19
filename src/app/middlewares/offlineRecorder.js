import { ipcRenderer } from 'electron'

import { selectors } from 'pltr/v2'

const offlineRecorder = (store) => (next) => (action) => {
  const result = next(action)

  const state = store.getState().present
  if (selectors.isCloudFileSelector(state) && !selectors.isOfflineSelector(state)) {
    ipcRenderer.send('record-offline-backup', state)
  }

  return result
}

export default offlineRecorder

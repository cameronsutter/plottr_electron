import { ipcRenderer } from 'electron'

const offlineRecorder = (store) => (next) => (action) => {
  const result = next(action)

  const state = store.getState().present
  ipcRenderer.send('record-offline-backup', state)

  return result
}

export default offlineRecorder

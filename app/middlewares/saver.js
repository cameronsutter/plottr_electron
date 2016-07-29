import { ipcRenderer } from 'electron'

const saver = store => next => action => {
  const result = next(action)
  ipcRenderer.send('save-state', store.getState())
  return result
}

export default saver

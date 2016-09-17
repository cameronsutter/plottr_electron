import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()

const saver = store => next => action => {
  const result = next(action)
  ipcRenderer.send('save-state', store.getState(), win.id)
  return result
}

export default saver

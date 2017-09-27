import { FILE_SAVED } from 'constants/ActionTypes'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()

const saver = store => next => action => {
  const result = next(action)
  if (action.type === FILE_SAVED) return result
  ipcRenderer.send('save-state', store.getState(), win.id)
  return result
}

export default saver

import { FILE_SAVED, NEW_FILE } from 'constants/ActionTypes'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()

const saver = store => next => action => {
  const result = next(action)
  if (action.type === FILE_SAVED) return result
  var isNewFile = action.type === NEW_FILE
  ipcRenderer.send('save-state', store.getState(), win.id, isNewFile)
  return result
}

export default saver

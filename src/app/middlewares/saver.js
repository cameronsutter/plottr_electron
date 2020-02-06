import { FILE_SAVED, NEW_FILE, FILE_LOADED } from 'constants/ActionTypes'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()

const BLACKLIST = [FILE_SAVED, FILE_LOADED]

const saver = store => next => action => {
  const result = next(action)
  if (BLACKLIST.includes(action.type)) return result
  var isNewFile = action.type === NEW_FILE
  ipcRenderer.send('save-state', store.getState(), win.id, isNewFile)
  return result
}

export default saver

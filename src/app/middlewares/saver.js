import { ipcRenderer } from 'electron'
import { ActionTypes } from 'pltr/v2'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes

const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]

const saver = (store) => (next) => (action) => {
  const result = next(action)
  if (shouldIgnoreAction(action)) return result
  if (BLACKLIST.includes(action.type)) return result
  const state = store.getState().present
  // save and backup
  saveFile(state.file.fileName, state)
  return result
}

let saveTimeout = null
let resetCount = 0
// The number of edits within a second of each other before we force a
// save.
const MAX_RESETS = 200

function saveFile(filePath, jsonData) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    resetCount++
  }
  function forceSave() {
    ipcRenderer.send('auto-save', filePath, jsonData)
    resetCount = 0
    saveTimeout = null
  }
  if (resetCount >= MAX_RESETS) {
    forceSave()
  }
  saveTimeout = setTimeout(forceSave, 1000)
}

export default saver

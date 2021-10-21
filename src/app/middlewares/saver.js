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
  if (state.file.isCloudFile) {
    saveFile(state.file.id, state)
  } else if (state.file.fileName !== '') {
    saveFile(state.file.fileName, state)
  }
  return result
}

let saveTimeout = null
let resetCount = 0
let previousFile = null
// The number of edits within a second of each other before we force a
// save.
const MAX_RESETS = 200

function saveFile(filePath, jsonData) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    resetCount++
  }
  if (!previousFile) {
    previousFile = jsonData
  }
  const forceSave = (previousFile) => () => {
    ipcRenderer.send('auto-save', filePath, jsonData, jsonData.client.userId, previousFile)
    resetCount = 0
    saveTimeout = null
  }
  const forceSavePrevious = forceSave(previousFile)
  previousFile = jsonData
  if (resetCount >= MAX_RESETS) {
    forceSavePrevious()
    return
  }
  saveTimeout = setTimeout(forceSavePrevious, 10000)
}

export default saver

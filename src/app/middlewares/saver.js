import { ipcRenderer } from 'electron'
import { saveBackup } from 'wired-up-firebase'
import { ActionTypes, selectors } from 'pltr/v2'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes

const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]

const saver = (store) => (next) => (action) => {
  const result = next(action)
  if (shouldIgnoreAction(action)) return result
  if (BLACKLIST.includes(action.type)) return result
  if (selectors.isResumingSelector(state)) return result

  const state = store.getState().present
  // save and backup
  const isOffline = !selectors.isOfflineSelector(state)
  if (selectors.isCloudFileSelector(state) && !isOffline) {
    saveFile(state.file.id, state, isOffline)
  } else if (state.file.fileName !== '') {
    saveFile(state.file.fileName, state, isOffline)
  }
  return result
}

let saveTimeout = null
let resetCount = 0
let previousFile = null
let backupTimeout = null
let backupResetCount = 0
// The number of edits within a second of each other before we force a
// save.
const MAX_RESETS = 200

const cloudBackup = (userId, file) => {
  const onCloud = file.file.isCloudFile
  const forceBackup = (previousFile) => () => {
    saveBackup(userId, previousFile || file)
    backupResetCount = 0
    backupTimeout = null
  }
  const forceBackupPrevious = forceBackup(previousFile)
  if (onCloud) {
    if (backupTimeout) {
      clearTimeout(backupTimeout)
      ++backupResetCount
    }
    if (backupResetCount >= MAX_RESETS) {
      forceBackupPrevious()
      return
    }
    // NOTE: We want to backup every 60 seconds, but saves only happen
    // every 10 seconds.
    backupTimeout = setTimeout(forceBackupPrevious, 50000)
  }
}

function saveFile(filePath, jsonData, isOffline) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    resetCount++
  }
  if (!previousFile) {
    previousFile = jsonData
  }
  const forceSave = (previousFile) => () => {
    ipcRenderer.send('auto-save', filePath, jsonData, jsonData.client?.userId, previousFile)
    resetCount = 0
    saveTimeout = null
  }
  const forceSavePrevious = forceSave(previousFile)
  previousFile = jsonData
  if (resetCount >= MAX_RESETS) {
    forceSavePrevious()
    if (!isOffline) {
      cloudBackup(jsonData.client?.userId, jsonData)
    }
    return
  }
  saveTimeout = setTimeout(forceSavePrevious, 1000)
}

export default saver

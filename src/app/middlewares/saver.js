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

  const state = store.getState().present
  if (selectors.isResumingSelector(state)) return result

  // save and backup
  const isOffline = selectors.isOfflineSelector(state)
  const fileName = selectors.fileNameSelector(state)
  const offlineModeEnabled = selectors.offlineModeEnabledSelector(state)
  // If we're working on a cloud file, are offline and offline mode
  // isn't enabled, don't save the file.
  if (selectors.isCloudFileSelector(state) && isOffline && !offlineModeEnabled) {
    return result
  } else if (selectors.isCloudFileSelector(state) && !isOffline) {
    const fileId = selectors.fileIdSelector(state)
    saveFile(fileId, state, isOffline)
  } else if (fileName !== '') {
    saveFile(fileName, state, isOffline)
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
  const onCloud = selectors.isCloudFileSelector(file)
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
    const userId = selectors.userIdSelector(jsonData)
    ipcRenderer.send('auto-save', filePath, jsonData, userId, previousFile)
    resetCount = 0
    saveTimeout = null
    if (!isOffline) {
      cloudBackup(userId, jsonData)
    }
  }
  const forceSavePrevious = forceSave(previousFile)
  previousFile = jsonData
  if (resetCount >= MAX_RESETS) {
    forceSavePrevious()
    return
  }
  saveTimeout = setTimeout(forceSavePrevious, 1000)
}

export default saver

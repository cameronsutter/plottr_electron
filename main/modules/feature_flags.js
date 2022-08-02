import { BrowserWindow } from 'electron'
import log from 'electron-log'

import currentSettings from './settings'

const broadcastSetBeatHierarchy = () => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send('set-beat-hierarchy')
  })
}

const broadcastUnsetBeatHierarchy = () => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send('unset-beat-hierarchy')
  })
}

const featureFlags = () => {
  return currentSettings()
    .then((settings) => {
      return {
        beatHierarchy: settings.user.beatHierarchy,
      }
    })
    .catch((error) => {
      log.error('Could not read current settings when trying to get beatHierarchy', error)
      return Promise.reject(error)
    })
}

export { broadcastSetBeatHierarchy, broadcastUnsetBeatHierarchy, featureFlags }

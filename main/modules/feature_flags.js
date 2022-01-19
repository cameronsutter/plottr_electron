import { BrowserWindow } from 'electron'
import SETTINGS from './settings'

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

const featureFlags = () => ({
  beatHierarchy: SETTINGS.get('user.beatHierarchy'),
})

export {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
  featureFlags,
}

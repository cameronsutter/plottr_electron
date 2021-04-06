const { BrowserWindow } = require('electron')
const SETTINGS = require('./settings')

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

module.exports = {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
  featureFlags,
}

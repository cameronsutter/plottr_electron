const { BrowserWindow } = require('electron')

export const broadcastToAllWindows = (event, payload) => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send(event, payload)
  })
}

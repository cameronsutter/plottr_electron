const { BrowserWindow } = require('electron')

const broadcastToAllWindows = (event, payload) => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send(event, payload)
  })
}

module.exports = { broadcastToAllWindows }

import { BrowserWindow } from 'electron'

const broadcastToAllWindows = (event, payload) => {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send(event, payload)
  })
}

export { broadcastToAllWindows }

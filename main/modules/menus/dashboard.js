import { BrowserWindow } from 'electron'

export const openDashboard = () => {
  const win = BrowserWindow.getFocusedWindow()
  win.webContents.send('open-dashboard')
}

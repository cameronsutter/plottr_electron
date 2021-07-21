import { ipcRenderer } from 'electron'

export const openDashboard = () => {
  ipcRenderer.send('open-dashboard')
}

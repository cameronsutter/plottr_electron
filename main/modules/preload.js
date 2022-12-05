import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args)
  },
  listen: (channel, cb) => {
    ipcRenderer.on(channel, cb)
  },
  stopListening: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener)
  },
})

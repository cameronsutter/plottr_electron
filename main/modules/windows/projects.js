import path from 'path'
import { app, ipcMain } from 'electron'
import log from 'electron-log'
import { makeBrowserWindow } from '../utils'
import { filePrefix } from '../helpers'
import { updateOpenFiles } from './files'
import { rollbar } from '../rollbar'
import { getWindowById, addNewWindow, dereferenceWindow, focusIfOpen } from '.'
import { addToKnown } from '../known_files'
import { setLastOpenedFilePath } from '../lastOpened'

ipcMain.on('pls-open-window', (event, filePath, unknown) => {
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
})

function openProjectWindow(filePath) {
  if (focusIfOpen(filePath)) return
  const newWindow = makeBrowserWindow(filePath)

  const entryFile = filePrefix(path.join(__dirname, 'app.html'))
  newWindow.loadURL(entryFile)

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) || e.sender // depends on 'this' being the window
    if (win) {
      updateOpenFiles(win.filePath)
      dereferenceWindow(win)
      win.browserWindow.webContents.destroy()
    }
  })

  try {
    app.addRecentDocument(filePath)
    addNewWindow(newWindow, filePath)
    setLastOpenedFilePath(filePath)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, { filePath: filePath })
    newWindow.destroy()
  }
}

export { openProjectWindow }

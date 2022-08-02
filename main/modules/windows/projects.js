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
  log.info('Received command to open window for', filePath)
  openProjectWindow(filePath)
    .then(() => {
      if (unknown) addToKnown(filePath)
    })
    .catch((error) => {
      log.error('Error opening a new window', error)
    })
})

function openProjectWindow(filePath) {
  if (focusIfOpen(filePath)) {
    log.info(`Project window for ${filePath} is already oepen, focussing it.`)
    return null
  }
  log.info('Opening new browserWindow for', filePath)
  return makeBrowserWindow(filePath)
    .then((newWindow) => {
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
        if (filePath) {
          app.addRecentDocument(filePath)
          setLastOpenedFilePath(filePath)
        }
        addNewWindow(newWindow, filePath)
      } catch (err) {
        log.warn(err)
        rollbar.warn(err, { filePath: filePath })
        newWindow.destroy()
      }
      return newWindow
    })
    .catch((error) => {
      log.error('Error opening project window', error)
      return Promise.reject(error)
    })
}

export { openProjectWindow }

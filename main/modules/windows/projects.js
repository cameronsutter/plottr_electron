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

ipcMain.on('pls-open-window', (event, replyChannel, fileURL, unknown) => {
  log.info('Received command to open window for', fileURL)
  openProjectWindow(fileURL)
    .then(() => {
      if (unknown) {
        return addToKnown(fileURL)
      }
      return true
    })
    .catch((error) => {
      log.error('Error opening a new window', error)
    })
    .then(() => {
      event.sender.send(replyChannel, 'fileURL')
    })
})

function openProjectWindow(fileURL) {
  if (focusIfOpen(fileURL)) {
    log.info(`Project window for ${fileURL} is already oepen, focussing it.`)
    return Promise.resolve()
  }
  log.info('Opening new browserWindow for', fileURL)
  return makeBrowserWindow(fileURL)
    .then((newWindow) => {
      const entryFile = filePrefix(path.join(__dirname, 'app.html'))
      newWindow.loadURL(entryFile)

      newWindow.on('close', function (e) {
        const win = getWindowById(this.id) || e.sender // depends on 'this' being the window
        if (win) {
          updateOpenFiles(win.fileURL)
          dereferenceWindow(win)
          win.browserWindow.webContents.destroy()
        }
      })

      try {
        if (fileURL) {
          app.addRecentDocument(fileURL)
          setLastOpenedFilePath(fileURL)
        }
        addNewWindow(newWindow, fileURL)
      } catch (err) {
        log.warn(err)
        rollbar.warn(err, { fileURL })
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

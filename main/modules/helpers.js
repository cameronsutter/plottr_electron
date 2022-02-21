import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { app, BrowserWindow, dialog } from 'electron'
import { is } from 'electron-util'
import { NODE_ENV } from './constants'

function takeScreenshot() {
  let win = BrowserWindow.getFocusedWindow()
  if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
  win.capturePage().then((image) => {
    if (NODE_ENV === 'development') {
      const folderPath = path.join(app.getPath('home'), 'plottr_screenshots', app.getVersion())
      const date = new Date()
      const fileName = `screenshot-${date.getMinutes()}-${date.getSeconds()}.png`
      const filePath = path.join(folderPath, fileName)
      fs.stat(folderPath, (err, stat) => {
        if (err) {
          fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
              log.error(err)
            } else {
              fs.writeFile(filePath, image.toPNG(), () => {})
            }
          })
        } else {
          if (stat.isDirectory()) {
            fs.writeFile(filePath, image.toPNG(), () => {})
          }
        }
      })
    } else {
      const filters = [{ name: 'PNG file', extensions: ['png'] }]
      const fileName = dialog.showSaveDialogSync(win, { filters })
      if (fileName) fs.writeFile(is.linux ? fileName + '.png' : fileName, image.toPNG(), () => {})
    }
  })
}

function filePrefix(dirname) {
  return is.windows ? dirname : 'file://' + dirname
}

export { takeScreenshot, filePrefix }

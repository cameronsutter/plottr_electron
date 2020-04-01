const fs = require('fs')
const path = require('path')
const deep = require('deep-diff')
const log = require('electron-log')
const { app, BrowserWindow, dialog } = require('electron')
const emptyFile = require('./empty_file')

function emptyFileContents (name) {
  return emptyFile(name)
}

function isDirty (newState, oldState) {
  const diff = deep.diff(oldState, newState) || []
  let edited = false
  if (newState.file && newState.file.dirty && diff.length > 0) edited = true
  return edited
}

function takeScreenshot () {
  let win = BrowserWindow.getFocusedWindow()
  if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
  win.capturePage().then(image => {
    if (process.env.NODE_ENV === 'dev') {
      const folderPath = path.join(app.getPath('home'), 'plottr_screenshots', app.getVersion())
      const date = new Date()
      const fileName = `screenshot-${date.getMinutes()}-${date.getSeconds()}.png`
      const filePath = path.join(folderPath, fileName)
      fs.stat(folderPath, (err, stat) => {
        if (err) {
          fs.mkdir(folderPath, (err) => {
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
      const fileName = dialog.showSaveDialogSync(win)
      if (fileName) fs.writeFile(fileName + '.png', image.toPNG(), () => {})
    }
  })
}

module.exports = {
  emptyFileContents,
  isDirty,
  takeScreenshot,
}
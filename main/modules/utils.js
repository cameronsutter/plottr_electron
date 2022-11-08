import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { dialog, app, screen, BrowserWindow } from 'electron'
import windowStateKeeper from 'electron-window-state'
import i18n from 'plottr_locales'
import log from 'electron-log'

import { hasWindows } from './windows'
import { is } from 'electron-util'
import currentSettings from './settings'

function gracefullyNotSave() {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

function gracefullyQuit(safelyExit) {
  if (!app.isReady() || !hasWindows()) {
    dialog.showMessageBoxSync({
      type: 'info',
      buttons: [i18n('ok')],
      message: i18n('Plottr ran into a problem. Try opening Plottr again.'),
      detail: i18n('If you keep seeing this problem, email us at support@plottr.com'),
    })
    safelyExit.quitWhenDone()
  }
}

function makeBrowserWindow(fileURL) {
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeprFile = (fileURL || uuidv4()).replace(/[/\\]/g, '~')
  const numFileLetters = 100

  let multiplier = 0.9

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * multiplier),
    defaultHeight: parseInt(height * multiplier),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeprFile.slice(-numFileLetters),
  })

  return currentSettings()
    .then((settings) => {
      let config = {
        x: stateKeeper.x,
        y: stateKeeper.y,
        width: stateKeeper.width,
        height: stateKeeper.height,
        fullscreen: stateKeeper.isFullScreen || null,
        show: false,
        fullscreenable: true,
        webPreferences: {
          nodeIntegration: false,
          spellcheck:
            settings.user?.useSpellcheck === undefined ? true : settings.user?.useSpellcheck,
          webviewTag: true,
          contextIsolation: true,
        },
      }

      config.backgroundColor = '#f7f7f7'

      // Create the browser window
      let newWindow = new BrowserWindow(config)

      // register listeners on the window
      stateKeeper.manage(newWindow)

      newWindow.once('ready-to-show', () => {
        newWindow.show()
      })

      newWindow.webContents.on('did-finish-load', () => {
        if (!newWindow.isVisible()) newWindow.show()
      })

      newWindow.webContents.on('unresponsive', () => {
        log.warn('webContents became unresponsive')
        newWindow.webContents.reload()
      })
      newWindow.webContents.on('responsive', () => {
        log.info('webContents responsive again')
      })

      newWindow.on('unresponsive', () => {
        log.warn('window became unresponsive')
        newWindow.webContents.reload()
      })

      newWindow.on('responsive', () => {
        log.info('window responsive again')
      })

      newWindow.webContents.on(
        'new-window',
        (event, url, frameName, disposition, options, additionalFeatures) => {
          event.preventDefault()
        }
      )

      if (is.development || settings.forceDevTools) {
        newWindow.openDevTools()
      }

      return newWindow
    })
    .catch((error) => {
      log.error('Error creating a new window', error)
      return Promise.reject(error)
    })
}

export { gracefullyNotSave, gracefullyQuit, makeBrowserWindow }

const path = require('path')
const { dialog, app, screen, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')
const i18n = require('plottr_locales').t
const log = require('electron-log')
// const { rollbar } = require('./rollbar')
const { hasWindows } = require('./windows')
const SETTINGS = require('./settings')
const { is } = require('electron-util')

function gracefullyNotSave() {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

function gracefullyQuit() {
  if (!app.isReady() || !hasWindows()) {
    dialog.showMessageBoxSync({
      type: 'info',
      buttons: [i18n('ok')],
      message: i18n('Plottr ran into a problem. Try opening Plottr again.'),
      detail: i18n('If you keep seeing this problem, email us at support@plottr.com'),
    })
    app.quit()
  }
}

function makeBrowserWindow(filePath) {
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeprFile = filePath.replace(/[/\\]/g, '~')
  const numFileLetters = 100

  let multiplier = filePath == 'dashboard' ? 0.8 : 0.9

  let stateKeeper = windowStateKeeper({
    defaultWidth: parseInt(width * multiplier),
    defaultHeight: parseInt(height * multiplier),
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeprFile.slice(-numFileLetters),
  })

  let config = {
    x: stateKeeper.x,
    y: stateKeeper.y,
    width: stateKeeper.width,
    height: stateKeeper.height,
    fullscreen: stateKeeper.isFullScreen || null,
    show: false,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true,
      enableRemoteModule: true,
      webviewTag: true,
    },
  }

  if (filePath == 'dashboard') {
    config.titleBarStyle = 'hiddenInset'
    config.fullscreenable = false
    if (!is.macos) {
      config.frame = false
    }
  } else {
    config.backgroundColor = '#f7f7f7'
  }

  // Create the browser window
  let newWindow = new BrowserWindow(config)

  // register listeners on the window
  stateKeeper.manage(newWindow)

  newWindow.once('ready-to-show', () => {
    log.info('THREAD ready-to-show', newWindow.id, newWindow.isVisible())
    newWindow.show()
  })

  newWindow.webContents.on('did-finish-load', () => {
    log.info('THREAD did-finish-load', newWindow.id, newWindow.isVisible())
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

  if (is.development || SETTINGS.get('forceDevTools')) {
    newWindow.openDevTools()
  }

  return newWindow
}

module.exports = {
  gracefullyNotSave,
  gracefullyQuit,
  makeBrowserWindow,
}

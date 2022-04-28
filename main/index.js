import electron from 'electron'
import SETTINGS from './modules/settings'
import { setupI18n } from 'plottr_locales'
import { initialize } from '@electron/remote/main'
import Store from 'electron-store'

Store.initRenderer()

initialize()
setupI18n(SETTINGS, { electron })

const { app, BrowserWindow, globalShortcut } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import contextMenu from 'electron-context-menu'
import { setupRollbar } from './modules/rollbar'
import { loadMenu } from './modules/menus'
import { focusFirstWindow, hasWindows } from './modules/windows'
import { openProjectWindow } from './modules/windows/projects'
import { gracefullyQuit } from './modules/utils'
import { addToKnown } from './modules/known_files'
import { TEMP_FILES_PATH } from './modules/files'
import { connect, startServer } from './server'
import { listenOnIPCMain } from './listeners'

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
import { config } from 'dotenv'
config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (!is.development) {
  process.on('uncaughtException', function (error) {
    log.error(error)
    rollbar.error(error, function (sendErr, data) {
      gracefullyQuit()
    })
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }
}

app.userAgentFallback =
  'Firefox Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) plottr/2021.7.29 Chrome/85.0.4183.121 Electron/10.4.7 Safari/537.36'

// On MacOS, opening a file from finder is signalled to the app as an
// event (rather than by args).  So we want to make sure that when the
// app boots, it only opens a window corresponding to that event.
let openedFile = false

app.whenReady().then(() => {
  startServer()
    .then((port) => {
      log.info(`Socket worker started on ${port}`)
      return port
    })
    .catch((error) => {
      log.error('FATAL ERROR: Failed to start the socket server.  Killing the app.')
      app.quit()
    })
    .then((port) => {
      return connect(port)
    })
    .then((client) => {
      listenOnIPCMain(client)
      loadMenu()

      const fileLaunchedOn = fileToLoad(process.argv)

      // Wait a little bit in case the app was launched by double clicking
      // on a file.
      setTimeout(() => {
        if (!openedFile && !(fileLaunchedOn && is.macos)) {
          openedFile = true
          log.info(`Opening <${fileLaunchedOn}> from primary whenReady`)
          openProjectWindow(fileLaunchedOn)
        }
      }, 1000)

      // Register the toggleDevTools shortcut listener.
      globalShortcut.register('CommandOrControl+Alt+R', () => {
        let win = BrowserWindow.getFocusedWindow()
        if (win) win.toggleDevTools()
      })

      if (process.env.NODE_ENV != 'dev') {
        app.setAsDefaultProtocolClient('plottr')
      }

      app.on('activate', async () => {
        if (hasWindows()) {
          focusFirstWindow()
        } else {
          openProjectWindow(fileLaunchedOn)
        }
      })

      app.on('second-instance', (_event, argv) => {
        log.info('second-instance')
        loadMenu()
        const newFileToLoad = fileToLoad(argv)
        openProjectWindow(newFileToLoad)
      })

      app.on('window-all-closed', () => {
        if (is.windows) app.quit()
      })

      app.on('will-quit', () => {
        app.releaseSingleInstanceLock()
      })
    })
})

function fileToLoad(argv) {
  if (is.windows && process.env.NODE_ENV != 'dev') {
    log.info('windows open-file event handler')
    log.info('args', argv.length, argv)
    const param = argv[argv.length - 1]

    if (param.includes('.pltr')) {
      log.info(`Opening file with path ${param}`)
      return param
    } else {
      log.error(`Could not open file with path ${param}`)
    }
  }
  log.info(`Opening Plottr without booting a file and arguments: ${argv}`)
  return null
}

app.on('open-file', (event, filePath) => {
  // Prevent the app from opening a default window as well as the file.
  openedFile = true
  log.info(`Opening <${filePath}> from open file`)
  event.preventDefault()
  // mac/linux open-file event handler
  app.whenReady().then(() => {
    openProjectWindow(filePath)
    addToKnown(filePath)
  })
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})

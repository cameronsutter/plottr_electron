import electron, { dialog } from 'electron'
import WebSocket from 'ws'
import SETTINGS from './modules/settings'
import { setupI18n } from 'plottr_locales'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

setupI18n(SETTINGS, { locale: electron.app.getLocale() })

const { app, BrowserWindow, globalShortcut } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import contextMenu from 'electron-context-menu'

import { helpers } from 'pltr/v2'

import './modules/updater_events'
import { setupRollbar } from './modules/rollbar'
import { loadMenu } from './modules/menus'
import { focusFirstWindow, hasWindows } from './modules/windows'
import { openProjectWindow } from './modules/windows/projects'
import { gracefullyQuit } from './modules/utils'
import { addToKnown } from './modules/known_files'
import { TEMP_FILES_PATH } from './modules/files'
import { startServer } from './server'
import { listenOnIPCMain } from './listeners'
import {
  createClient,
  isInitialised,
  resetInitialised,
  setPort,
  getPort,
} from '../shared/socket-client'
import ProcessSwitches from './modules/processSwitches'
import makeSafelyExitModule from './modules/safelyExit'

const { ipcMain } = electron

////////////////////////////////
////       Arguments      //////
////////////////////////////////
/**
 * You can launch Plottr with command line arguments.  Using these
 * arguments, you can:
 *
 *  - Open a particular file: On Windows and Linux, the first
 *    user-supplied argument is the file to launch.  (MacOS uses a
 *    different means to open a file).
 *  - On any platform, you may supply the argument
 *    "--enable-test-utilities".  This will make various facilities to
 *    test and stress-test Plottr available at runtime for both the
 *    production and development builds.
 */

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
import { config } from 'dotenv'
import { broadcastToAllWindows } from './modules/broadcast'
import { setDarkMode } from './modules/theme'
config({ path: ENV_FILE_PATH })

let rollbar = {
  error: () => {},
}
setupRollbar('main', {})
  .then((instance) => {
    rollbar = instance
  })
  .catch((error) => {
    log.error('Failed to set up rollbar for main', error)
  })

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

const safelyExitModule = makeSafelyExitModule(log)

if (!is.development) {
  process.on('uncaughtException', function (error) {
    console.error('Uncaught exception.  Quitting...', error)
    log.error('Uncaught exception.  Quitting...', error)
    rollbar.error(error, function (sendErr, data) {
      gracefullyQuit(safelyExitModule)
    })
  })
  process.on('unhandledRejection', function (error) {
    console.error('Unhandled rejection.', error)
    log.error('Unhandled rejection.', error)
    rollbar.error(error)
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    safelyExitModule.quitWhenDone()
  }
}

app.userAgentFallback =
  'Firefox Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) plottr/2021.7.29 Chrome/85.0.4183.121 Electron/10.4.7 Safari/537.36'

// On MacOS, opening a file from finder is signalled to the app as an
// event (rather than by args).  So we want to make sure that when the
// app boots, it only opens a window corresponding to that event.
let openedFile = false

const broadcastPortChange = (port) => {
  if (!isInitialised()) {
    createClient(
      port,
      log,
      WebSocket,
      (error) => {
        log.error(`Failed to connect to socket server on port: <${port}>.  Killing the app.`, error)
        app.quit()
      },
      {
        onBusy: () => {
          safelyExitModule.busy()
        },
        onDone: () => {
          safelyExitModule.done()
        },
      }
    )
  }
  setPort(port)
  broadcastToAllWindows('update-worker-port', port)
}

const loadMenuFailureHandler = (error) => {
  log.error('Failed to load menu.', error)
  return Promise.reject(error)
}

app.whenReady().then(() => {
  const startSocketServer = () => {
    return startServer(
      log,
      broadcastPortChange,
      app.getPath('userData'),
      (error) => {
        log.error('FATAL ERROR: Failed to start the socket server.  Killing the app.', error)
        dialog.showErrorBox(
          'Error',
          "Plottr ran into a problem and can't start.  Please contact support."
        )
        setTimeout(() => {
          app.quit()
        }, 5000)
      },
      app.getVersion()
    )
      .then(({ port, killServer }) => {
        log.info(`Socket worker started on ${port}`)
        return { port, killServer }
      })
      .catch((error) => {
        log.error('FATAL ERROR: Failed to start the socket server.  Killing the app.', error)
        dialog.showErrorBox(
          'Error',
          "Plottr ran into a problem and can't start.  Please contact support."
        )
        setTimeout(() => {
          app.quit()
        }, 5000)
      })
  }

  startSocketServer()
    .then(({ port, killServer }) => {
      return loadMenu(safelyExitModule)
        .then(() => {
          return { port, killServer }
        })
        .catch(loadMenuFailureHandler)
    })
    .then(({ port, killServer }) => {
      const yargv = parseArguments(process.argv)
      log.info('yargv', yargv)
      const processSwitches = ProcessSwitches(yargv)
      const fileLaunchedOn = fileToLoad(process.argv)
      const fileLaunchedOnURL = helpers.file.filePathToFileURL(fileLaunchedOn)
      const restartServerRef = {
        killServer: killServer,
        restartServer: () => {
          resetInitialised()
          return restartServerRef
            .killServer()
            .then(() => {
              return startSocketServer().then(({ port, killServer }) => {
                setPort(port)
                restartServerRef.killServer = killServer
              })
            })
            .catch((error) => {
              log.error('Failed to restart the socket server.  Killing the app.', error)
              dialog.showErrorBox(
                'Error',
                'Plottr ran into a problem and needs to shutdown.  Please contact support.'
              )
              setTimeout(() => {
                app.quit()
              }, 5000)
            })
        },
      }

      listenOnIPCMain(() => getPort(), processSwitches, safelyExitModule, restartServerRef)

      const importFromScrivener = processSwitches.importFromScrivener()
      if (importFromScrivener) {
        const { sourceFile, destinationFile } = importFromScrivener
        log.info(`Importing ${sourceFile} to ${destinationFile}`)
        openProjectWindow(null)
          .then((newWindow) => {
            if (!newWindow) {
              throw new Error('Could not create window to export with.')
            }
            newWindow.on('ready-to-show', () => {
              ipcMain.once('listeners-registered', (event, replyChannel) => {
                try {
                  newWindow.webContents.send('import-scrivener-file', sourceFile, destinationFile)
                  event.sender.send(replyChannel, 'done')
                } catch (error) {
                  log.error(
                    `Error exporting ${sourceFile} to scrivener file at ${destinationFile}`,
                    error
                  )
                  event.sender.send(replyChannel, { error: error.message })
                }
              })
            })
          })
          .catch((error) => {
            log.error('Failed to create window to export with', error)
            return Promise.reject(error)
          })
      } else {
        // Wait a little bit in case the app was launched by double clicking
        // on a file.
        setTimeout(() => {
          if (!openedFile && !(fileLaunchedOnURL && is.macos)) {
            openedFile = true
            log.info(`Opening <${fileLaunchedOnURL}> from primary whenReady`)
            try {
              openProjectWindow(fileLaunchedOnURL)
                .then((newWindow) => {
                  log.info(`Created the project window for ${fileLaunchedOnURL}`)
                  if (fileLaunchedOnURL) addToKnown(fileLaunchedOnURL)
                })
                .catch((error) => {
                  log.error('Error creating the project window to boot a file from', error)
                })
            } catch (error) {
              log.error('Error booting file: ', error)
            }
          }
        })

        // Register the toggleDevTools shortcut listener.
        globalShortcut.register('CommandOrControl+Alt+R', () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) win.toggleDevTools()
        })

        // When given no argument, it'll look up the current one.
        setDarkMode().catch((error) => {
          log.error('Error setting initial theme', error)
        })

        if (process.env.NODE_ENV != 'dev') {
          app.setAsDefaultProtocolClient('plottr')
        }

        app.on('activate', async () => {
          if (hasWindows()) {
            focusFirstWindow()
          } else {
            log.info('Opening project window for', fileLaunchedOnURL)
            openProjectWindow(fileLaunchedOnURL)
              .then(() => {
                log.info('Opened a project window for', fileLaunchedOnURL)
              })
              .catch((error) => {
                log.error('Failed to open project window for', fileLaunchedOnURL, error)
              })
          }
        })

        app.on('second-instance', (_event, argv) => {
          log.info('second-instance')
          loadMenu(safelyExitModule)
            .then(() => {
              const newFileToLoad = fileToLoad(argv)
              const newFileToLoadURL = helpers.file.filePathToFileURL(newFileToLoad)
              if (newFileToLoadURL) addToKnown(newFileToLoadURL)
              openProjectWindow(newFileToLoadURL)
                .then(() => {
                  log.info('Opened a second instance for a file', newFileToLoadURL)
                })
                .catch((error) => {
                  log.error('Eror opening the second instance project window', error)
                })
            })
            .catch(loadMenuFailureHandler)
        })

        app.on('window-all-closed', () => {
          if (!is.macos) {
            safelyExitModule.quitWhenDone()
          }
        })

        app.on('will-quit', () => {
          app.releaseSingleInstanceLock()
        })
      }
    })
})

function parseArguments(processArgv) {
  return yargs(hideBin(processArgv)).argv
}

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

// macOS only.  Open file from finder.
app.on('open-file', (event, filePath) => {
  // Convert to a Plottr URL.
  const fileURL = helpers.file.filePathToFileURL(filePath)
  // Prevent the app from opening a default window as well as the file.
  openedFile = true
  log.info(`Opening <${fileURL}> from open file`)
  event.preventDefault()
  // mac/linux open-file event handler
  app.whenReady().then(() => {
    openProjectWindow(fileURL)
      .then(() => {
        log.info('Project window opened for ', fileURL)
        addToKnown(fileURL)
      })
      .catch((error) => {
        log.error('Failed to open a project window the second instance', fileURL, error)
      })
  })
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})

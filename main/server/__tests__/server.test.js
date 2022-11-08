import fs from 'fs'
import path from 'path'
import { createClient, whenClientIsReady } from '../../../shared/socket-client/index'

import { startServer } from '../init'

const NOP_LOGGER = {
  info: () => {},
  warn: () => {},
  error: () => {},
}
const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(...args)
  },
  warn: (...args) => {
    console.warn(...args)
  },
  error: (...args) => {
    console.error(...args)
  },
}

afterAll(async () => {
  for (const file of await fs.promises.readdir(path.join(__dirname, '../../../.test-output/'))) {
    if (file !== '.gitkeep') {
      await fs.promises.rm(path.join(__dirname, '../../../.test-output/', file), {
        recursive: true,
      })
    }
  }
})

// Starting a socket server takes time
jest.setTimeout(10000)

describe('startServer', () => {
  it('should start the server on a random port and broadcast that port without erroring out', async () => {
    let portBroadcasted = null
    const userDataDirectory = await fs.promises.mkdtemp(
      '.test-output/plottr_test_socket_server_userData'
    )
    const broadcastPort = (newPort) => {
      portBroadcasted = newPort
    }
    let fatalErrorOccured = false
    const onFatalError = () => {
      fatalErrorOccured = true
    }
    const port = await startServer(CONSOLE_LOGGER, broadcastPort, userDataDirectory, onFatalError)
    expect(port).toBeGreaterThan(0)
    createClient(
      port,
      CONSOLE_LOGGER,
      (error) => {
        CONSOLE_LOGGER.error(
          `Failed to connect to socket server on port: <${port}>.  Killing the app.`,
          error
        )
        throw error
      },
      {
        onSaveBackupError: (filePath, errorMessage) => {
          CONSOLE_LOGGER.error(`Failed to save a backup at ${filePath} because ${errorMessage}`)
        },
        onSaveBackupSuccess: (filePath) => {
          CONSOLE_LOGGER.info(`Succeeeded to save a backup at ${filePath} this time`)
        },
        onAutoSaveError: (filePath, errorMessage) => {
          CONSOLE_LOGGER.error(`Failed to auto save a file at ${filePath} because ${errorMessage}`)
        },
        onAutoSaveWorkedThisTime: () => {
          CONSOLE_LOGGER.info('Auto save worked this time')
        },
        onAutoSaveBackupError: (backupFilePath, backupErrorMessage) => {
          CONSOLE_LOGGER.error(
            `Couldn't save a backup at ${backupFilePath} during auto-save because ${backupErrorMessage}`
          )
        },
        onBusy: () => {},
        onDone: () => {},
      }
    )
    expect(portBroadcasted).toEqual(port)
    expect(fatalErrorOccured).toBeFalsy()
    await new Promise((resolve) => setTimeout(resolve, 5000))
    expect(fatalErrorOccured).toBeFalsy()
    await whenClientIsReady(({ shutdown }) => {
      return shutdown()
    })
  })
})

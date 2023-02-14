import fs from 'fs'
import path from 'path'
import { createClient, whenClientIsReady } from '../../../shared/socket-client/index'

import { startServer } from '../init'
import defaultSettings from '../../../shared/default_settings'
import export_config from 'plottr_import_export/src/exporter/default_config'

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

const baseTestDirectory = path.join(__dirname, '..', '..', '..', '.test-output')

afterAll(async () => {
  for (const file of await fs.promises.readdir(baseTestDirectory)) {
    if (file !== '.gitkeep') {
      await fs.promises.rm(path.join(baseTestDirectory, file), {
        recursive: true,
      })
    }
  }
  // ==========Shut Down the Server==========
  try {
    await whenClientIsReady(({ shutdown }) => {
      return shutdown()
    })
  } catch (error) {
    console.error('Failed to shut down the server!', error)
    throw error
  }
})

// Starting a socket server takes time
jest.setTimeout(40000)

describe('startServer', () => {
  it('should start, broadcast ports, have well-formed stores and ensure that various messages work', async () => {
    try {
      // ==========Basic Initialisation==========
      let portBroadcasted = null
      const userDataDirectory = await fs.promises.mkdtemp(
        path.join('.test-output', 'plottr_test_socket_server_userData')
      )
      const broadcastPort = (newPort) => {
        portBroadcasted = newPort
      }
      let fatalErrorOccured = false
      const onFatalError = () => {
        fatalErrorOccured = true
      }
      const { port, killServer } = await startServer(
        CONSOLE_LOGGER,
        broadcastPort,
        userDataDirectory,
        onFatalError
      )
      expect(typeof killServer).toEqual('function')
      expect(port).toBeGreaterThan(0)
      console.log('[Server Integration Test]: Started server...')
      await createClient(
        port,
        CONSOLE_LOGGER,
        WebSocket,
        (error) => {
          CONSOLE_LOGGER.error(
            `Failed to connect to socket server on port: <${port}>.  Killing the app.`,
            error
          )
          throw error
        },
        {
          onBusy: () => {},
          onDone: () => {},
        }
      )
      expect(portBroadcasted).toEqual(port)
      expect(fatalErrorOccured).toBeFalsy()
      console.log('[Server Integration Test]: Created client...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
      expect(fatalErrorOccured).toBeFalsy()
      console.log('[Server Integration Test]: No fatal errors detected...')

      // ==========Check the Stores==========
      const configFile = await fs.promises.readFile(path.join(userDataDirectory, 'config.json'))
      console.log('[Server Integration Test]: Config store exists...')
      const customTemplates = await fs.promises.readFile(
        path.join(userDataDirectory, 'custom_templates.json')
      )
      console.log('[Server Integration Test]: Custom templates store exist...')
      const exportConfig = await fs.promises.readFile(
        path.join(userDataDirectory, 'export_config.json')
      )
      console.log('[Server Integration Test]: Export config store exists...')
      const knownFiles = await fs.promises.readFile(
        path.join(userDataDirectory, 'known_files.json')
      )
      console.log('[Server Integration Test]: Known files store exist...')
      const lastOpened = await fs.promises.readFile(
        path.join(userDataDirectory, 'last_opened.json')
      )
      console.log('[Server Integration Test]: Last opened store exists...')
      const licenseInfo = await fs.promises.readFile(
        path.join(userDataDirectory, 'license_info.json')
      )
      console.log('[Server Integration Test]: License info store exists...')
      const templates = await fs.promises.readFile(path.join(userDataDirectory, 'templates.json'))
      console.log('[Server Integration Test]: Templates store exists...')
      const trialInfo = await fs.promises.readFile(path.join(userDataDirectory, 'trial_info.json'))
      console.log('[Server Integration Test]: Trial info store exist...')
      const parsedConfigFile = JSON.parse(configFile)
      expect(typeof parsedConfigFile).toEqual('object')
      expect(parsedConfigFile).toMatchObject(defaultSettings)
      console.log('[Server Integration Test]: Config file parsed...')
      const parsedCustomTemplates = JSON.parse(customTemplates)
      expect(typeof parsedCustomTemplates).toEqual('object')
      expect(parsedCustomTemplates).toMatchObject({})
      console.log('[Server Integration Test]: Custom templates parsed...')
      const parsedExportConfig = JSON.parse(exportConfig)
      expect(typeof parsedExportConfig).toEqual('object')
      expect(parsedExportConfig).toMatchObject(parsedExportConfig)
      console.log('[Server Integration Test]: Export config parsed...')
      const parsedKnownFiles = JSON.parse(knownFiles)
      expect(typeof parsedKnownFiles).toEqual('object')
      expect(parsedKnownFiles).toMatchObject({})
      console.log('[Server Integration Test]: Known files parsed...')
      const parsedLastOpened = JSON.parse(lastOpened)
      expect(typeof parsedLastOpened).toEqual('object')
      expect(parsedLastOpened).toMatchObject({})
      console.log('[Server Integration Test]: Last opened parsed...')
      const parsedLicenseInfo = JSON.parse(licenseInfo)
      expect(typeof parsedLicenseInfo).toEqual('object')
      expect(parsedLicenseInfo).toMatchObject({})
      console.log('[Server Integration Test]: License info parsed...')
      const parsedTemplates = JSON.parse(templates)
      expect(typeof parsedTemplates).toEqual('object')
      expect(parsedTemplates).toMatchObject({})
      console.log('[Server Integration Test]: Templates parsed...')
      const parsedTrialInfo = JSON.parse(trialInfo)
      expect(typeof parsedTrialInfo).toEqual('object')
      expect(parsedTrialInfo).toMatchObject({})
      console.log('[Server Integration Test]: Trial info parsed...')

      // ==========Check that Last Opened Logic Works==========
      console.log('[Server Integration Test]: Does last opened logic work?')
      await whenClientIsReady(({ setLastOpenedFilePath }) => {
        return setLastOpenedFilePath('device:///dummy-path.pltr')
      })
      const lastOpenedSet = await fs.promises.readFile(
        path.join(userDataDirectory, 'last_opened.json')
      )
      const parsedLastOpenedSet = JSON.parse(lastOpenedSet)
      expect(parsedLastOpenedSet).toMatchObject({
        lastOpenedFilePath: 'device:///dummy-path.pltr',
      })
      await whenClientIsReady(({ nukeLastOpenedFileURL }) => {
        return nukeLastOpenedFileURL()
      })
      // It might take time for (Windows, e.g.) to flush the operation
      // to disk.
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const lastOpenedAfter = await fs.promises.readFile(
        path.join(userDataDirectory, 'last_opened.json')
      )
      const parsedLastOpenedAfter = JSON.parse(lastOpenedAfter)
      expect(parsedLastOpenedAfter).toMatchObject({})
      console.log('[Server Integration Test]: Last opened works!')

      // ==========Check that we can kill the server==========
      console.log('[Server Integration Test]: Can we kill the server?')
      await killServer()
      // This will be short circuited by an error if `killServer`
      // fails.
      expect(true).toEqual(true)
      console.log('[Server Integration Test]: Yes, we can kill the server!')

      // Start the server again so that we can test the shutdown
      // command during clean up
      console.log('[Server Integration Test]: Does the shutdown from cleanup work?')
      const finalServer = await startServer(
        CONSOLE_LOGGER,
        broadcastPort,
        userDataDirectory,
        onFatalError
      )
      await createClient(
        finalServer.port,
        CONSOLE_LOGGER,
        WebSocket,
        (error) => {
          CONSOLE_LOGGER.error(
            `Failed to connect to socket server on port: <${port}>.  Killing the app.`,
            error
          )
          throw error
        },
        {
          onBusy: () => {},
          onDone: () => {},
        }
      )
      console.log('[Server Integration Test]: Yes, we can shutdown from cleanup!')
    } catch (error) {
      console.error('Failed with', error)
      throw error
    }
  })
})

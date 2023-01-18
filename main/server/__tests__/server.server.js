import fs from 'fs'
import path from 'path'
import { createClient, whenClientIsReady } from '../../../shared/socket-client/index'

import { startServer } from '../init'
import defaultSettings from '../../../shared/default_settings'
import export_config from 'plottr_import_export/exporter/default_config'

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
jest.setTimeout(30000)

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
      await new Promise((resolve) => setTimeout(resolve, 5000))
      expect(fatalErrorOccured).toBeFalsy()

      // ==========Check the Stores==========
      const configFile = await fs.promises.readFile(path.join(userDataDirectory, 'config_dev.json'))
      const customTemplates = await fs.promises.readFile(
        path.join(userDataDirectory, 'custom_templates_dev.json')
      )
      const exportConfig = await fs.promises.readFile(
        path.join(userDataDirectory, 'export_config_dev.json')
      )
      const knownFiles = await fs.promises.readFile(
        path.join(userDataDirectory, 'known_files_dev.json')
      )
      const lastOpened = await fs.promises.readFile(
        path.join(userDataDirectory, 'last_opened_dev.json')
      )
      const licenseInfo = await fs.promises.readFile(
        path.join(userDataDirectory, 'license_info.json')
      )
      const templates = await fs.promises.readFile(
        path.join(userDataDirectory, 'templates_dev.json')
      )
      const trialInfo = await fs.promises.readFile(path.join(userDataDirectory, 'trial_info.json'))
      const parsedConfigFile = JSON.parse(configFile)
      expect(typeof parsedConfigFile).toEqual('object')
      expect(parsedConfigFile).toMatchObject(defaultSettings)
      const parsedCustomTemplates = JSON.parse(customTemplates)
      expect(typeof parsedCustomTemplates).toEqual('object')
      expect(parsedCustomTemplates).toMatchObject({})
      const parsedExportConfig = JSON.parse(exportConfig)
      expect(typeof parsedExportConfig).toEqual('object')
      expect(parsedExportConfig).toMatchObject(parsedExportConfig)
      const parsedKnownFiles = JSON.parse(knownFiles)
      expect(typeof parsedKnownFiles).toEqual('object')
      expect(parsedKnownFiles).toMatchObject({})
      const parsedLastOpened = JSON.parse(lastOpened)
      expect(typeof parsedLastOpened).toEqual('object')
      expect(parsedLastOpened).toMatchObject({})
      const parsedLicenseInfo = JSON.parse(licenseInfo)
      expect(typeof parsedLicenseInfo).toEqual('object')
      expect(parsedLicenseInfo).toMatchObject({})
      const parsedTemplates = JSON.parse(templates)
      expect(typeof parsedTemplates).toEqual('object')
      expect(parsedTemplates).toMatchObject({})
      const parsedTrialInfo = JSON.parse(trialInfo)
      expect(typeof parsedTrialInfo).toEqual('object')
      expect(parsedTrialInfo).toMatchObject({})

      // ==========Check that Last Opened Logic Works==========
      await whenClientIsReady(({ setLastOpenedFilePath }) => {
        return setLastOpenedFilePath('device:///dummy-path.pltr')
      })
      const lastOpenedSet = await fs.promises.readFile(
        path.join(userDataDirectory, 'last_opened_dev.json')
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
        path.join(userDataDirectory, 'last_opened_dev.json')
      )
      const parsedLastOpenedAfter = JSON.parse(lastOpenedAfter)
      expect(parsedLastOpenedAfter).toMatchObject({})

      // ==========Check that we can kill the server==========
      await killServer()
      // This will be short circuited by an error if `killServer`
      // fails.
      expect(true).toEqual(true)

      // Start the server again so that we can test the shutdown
      // command during clean up
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
    } catch (error) {
      console.error('Failed with', error)
      throw error
    }
  })
})

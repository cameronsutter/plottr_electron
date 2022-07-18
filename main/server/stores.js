import fs from 'fs'
import path from 'path'
import { isEqual, cloneDeep, set, get } from 'lodash'

import export_config from 'plottr_import_export/src/exporter/default_config'

import defaultSettings from '../../shared/default_settings'

const { readFile, writeFile } = fs.promises

export const TRIAL_INFO_PATH = 'trial_info'
export const USER_INFO_PATH = 'license_info'
export const OPEN_FILES_PATH = 'open_files'
export const KNOWN_FILES_PATH = 'known_files'
export const TEMPLATES_MANIFEST_PATH = 'templates_manifest'
export const TEMPLATES_PATH = 'templates'
export const CUSTOM_TEMPLATES_PATH = 'custom_templates'
export const TMP_PATH = 'tmp'
export const EXPORT_CONFIG_PATH = 'export_config'

const knownFilesPath =
  process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const templatesPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath =
  process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH
const manifestPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_MANIFEST_PATH}_dev` : TEMPLATES_MANIFEST_PATH
const exportPath =
  process.env.NODE_ENV == 'development' ? `${EXPORT_CONFIG_PATH}_dev` : EXPORT_CONFIG_PATH

class Store {
  store = {}
  watchers = new Set()

  constructor(userDataPath, logger, { name, watch, defaults }) {
    logger.info(`Constructing store for: ${name}`)

    this.name = name
    this.watch = watch
    this.defaults = defaults
    this.logger = logger
    this.path = path.join(userDataPath, `${name}.json`)

    this.readStore().then(() => {
      this.watchStore()
    })
  }

  watchStore = () => {
    fs.watchFile(this.path, (currentFileStats, _previousFileStats) => {
      if (!currentFileStats.isFile()) {
        this.logger.warn(
          `File for store connected to ${this.name} at ${path} dissapeared.  Setting store to empty.`
        )
        return
      }
      this.readStore().then((didChange) => {
        this.publishChangesToWatchers()
      })
    })
  }

  publishChangesToWatchers = () => {
    this.watchers.forEach((cb) => {
      cb(this.store)
    })
  }

  onDidAnyChange = (cb) => {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }

  readStore = () => {
    return readFile(this.path)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          // The store doesn't yet exist.  Create it.
          this.store = {}
          return this.writeStore().then(() => {
            return '{}'
          })
        }
        this.logger.error(`Failed to construct store for ${this.name} at ${this.path}`, error)
        throw new Error(`Failed to construct store for ${this.name} at ${this.path}`, error)
      })
      .then((storeContents) => {
        try {
          const previousValue = this.store
          this.store = storeContents.toString() === '' ? {} : JSON.parse(storeContents)
          return !isEqual(previousValue, this.store)
        } catch (error) {
          this.logger.error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
          throw new Error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
        }
      })
  }

  has = (key) => {
    return !!this.store[key]
  }

  writeStore = () => {
    return writeFile(this.path, JSON.stringify(this.store)).catch((error) => {
      this.logger.error(`Failed to write ${this.store} store for {this.path}`, error)
      throw new Error(`Failed to write ${this.store} store for {this.path}`, error)
    })
  }

  set = (key, value) => {
    this.store = cloneDeep(this.store)
    set(this.store, key, value)
    return this.writeStore()
  }

  clear = () => {
    this.store = {}
    return this.writeStore()
  }

  delete = (id) => {
    this.store = cloneDeep(this.store)
    delete this.store[id]
    return this.writeStore()
  }

  get = (key) => {
    return get(this.store, key)
  }
}

const makeStores = (userDataPath, logger) => {
  const trialStore = new Store(userDataPath, logger, { name: TRIAL_INFO_PATH, watch: true })
  const licenseStore = new Store(userDataPath, logger, { name: USER_INFO_PATH, watch: true })
  const knownFilesStore = new Store(userDataPath, logger, { name: knownFilesPath, watch: true })
  const templatesStore = new Store(userDataPath, logger, { name: templatesPath, watch: true })
  const customTemplatesStore = new Store(userDataPath, logger, {
    name: customTemplatesPath,
    watch: true,
  })
  const exportConfigStore = new Store(userDataPath, logger, {
    name: exportPath,
    watch: true,
    defaults: export_config,
  })
  const manifestStore = new Store(userDataPath, logger, { name: manifestPath })
  const USER = new Store(userDataPath, logger, { name: USER_INFO_PATH })

  const settingsStorePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'
  const SETTINGS = new Store(userDataPath, logger, {
    defaults: defaultSettings,
    name: settingsStorePath,
  })

  // ===Migrations===

  function migrateKnownFileStore() {
    // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
    const needsMigration = knownFilesStore.has('byIds') || knownFilesStore.has('allIds')
    if (needsMigration) {
      // it's in the old format and we need to migrate
      // const filesById = knownFilesStore.get('byIds')
      const fileIds = knownFilesStore.get('allIds')
      const fileObjects = fileIds.reduce((acc, id, idx) => {
        const key = `byIds.${id.replace('.', '~$~')}`
        const val = knownFilesStore.get(key)
        if (val) {
          // create an entry for this file
          const newId = idx + 1
          const entry = {
            path: id,
            lastOpened: val.lastOpened,
          }
          acc[newId] = entry
        }
        return acc
      }, {})
      knownFilesStore.clear()
      knownFilesStore.set(fileObjects)
    }
  }

  migrateKnownFileStore()

  return {
    trialStore,
    licenseStore,
    knownFilesStore,
    templatesStore,
    customTemplatesStore,
    exportConfigStore,
    manifestStore,
    USER,
    SETTINGS,
  }
}

export default makeStores

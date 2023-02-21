import { basename } from 'path'

import export_config from 'plottr_import_export/src/exporter/default_config'

import { helpers } from 'pltr/v2'

import defaultSettings from '../../shared/default_settings'
import Store from '../lib/store'

export const TRIAL_INFO_PATH = 'trial_info'
export const USER_INFO_PATH = 'license_info'
export const OPEN_FILES_PATH = 'open_files'
export const KNOWN_FILES_PATH = 'known_files'
export const TEMPLATES_MANIFEST_PATH = 'templates_manifest'
export const TEMPLATES_PATH = 'templates'
export const CUSTOM_TEMPLATES_PATH = 'custom_templates'
export const TMP_PATH = 'tmp'
export const EXPORT_CONFIG_PATH = 'export_config'
export const TEMP_FILES_PATH = 'tmp'
export const LAST_OPENED_PATH = 'last_opened'
export const CONFIG_STORE_PATH = 'config'

export const migrateKnownFilesStoreObject = (knownFiles) => {
  return Object.entries(knownFiles).reduce((acc, [key, value]) => {
    if (!value.path && !value.fileURL) {
      return acc
    }

    const fileURL = value.fileURL || helpers.file.filePathToFileURL(value.path)
    if (!fileURL) {
      return acc
    }

    return {
      ...acc,
      [fileURL]: {
        fileURL,
        fileName: basename(helpers.file.withoutProtocol(fileURL), '.pltr'),
        lastOpened: value.lastOpened,
      },
    }
  }, {})
}

export const migrateTempFilesStoreObject = (tempFiles) => {
  return Object.entries(tempFiles).reduce((acc, [key, value]) => {
    if (!value.path && !value.fileURL) {
      return acc
    }

    const fileURL = value.fileURL || helpers.file.filePathToFileURL(value.path)
    if (!fileURL) {
      return acc
    }

    return {
      ...acc,
      [fileURL]: {
        fileURL,
      },
    }
  }, {})
}

const makeStores = (userDataPath, logger, isAlphaOrBeta = false) => {
  // This hack bypasess a the define plugin for node_env that forced
  // it to development when in test.
  const NODE_ENV = JSON.parse(JSON.stringify(process.env)).NODE_ENV
  const isDevelopment = NODE_ENV == 'development'
  const suffix = isDevelopment ? '_dev' : isAlphaOrBeta ? '_test' : ''
  const tempPath = `${TMP_PATH}${suffix}`
  const knownFilesPath = `${KNOWN_FILES_PATH}${suffix}`
  const templatesPath = `${TEMPLATES_PATH}${suffix}`
  const customTemplatesPath = `${CUSTOM_TEMPLATES_PATH}${suffix}`
  const manifestPath = `${TEMPLATES_MANIFEST_PATH}${suffix}`
  const exportPath = `${EXPORT_CONFIG_PATH}${suffix}`
  const LAST_OPENED_NAME = `${LAST_OPENED_PATH}${suffix}`

  const trialStore = new Store(userDataPath, logger, { name: TRIAL_INFO_PATH, watch: true })
  const licenseStore = new Store(userDataPath, logger, { name: USER_INFO_PATH, watch: true })
  const knownFilesStore = new Store(userDataPath, logger, { name: knownFilesPath, watch: true })
  const tempFilesStore = new Store(userDataPath, logger, {
    name: tempPath,
    watch: true,
  })
  const templatesStore = new Store(userDataPath, logger, {
    name: templatesPath,
    watch: true,
    onInvalidStore: resetTemplates,
  })
  const customTemplatesStore = new Store(userDataPath, logger, {
    name: customTemplatesPath,
    watch: true,
  })
  const exportConfigStore = new Store(userDataPath, logger, {
    name: exportPath,
    watch: true,
    defaults: export_config,
  })
  const manifestStore = new Store(userDataPath, logger, {
    name: manifestPath,
    watch: true,
    onInvalidStore: resetTemplates,
  })
  const USER = new Store(userDataPath, logger, { name: USER_INFO_PATH, watch: true })
  function resetTemplates() {
    logger.info('Clearing template store and manifest store.')
    return templatesStore.clear().then(() => {
      return manifestStore.clear().then(() => {
        return Promise.reject(new Error('Error reading templates'))
      })
    })
  }

  const settingsStorePath = `${CONFIG_STORE_PATH}${suffix}`
  const SETTINGS = new Store(userDataPath, logger, {
    defaults: defaultSettings,
    name: settingsStorePath,
    watch: true,
  })
  const lastOpenedFileStore = new Store(userDataPath, logger, {
    name: LAST_OPENED_NAME,
    watch: true,
  })

  // ===Migrations===

  function oldMigration() {
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
      return knownFilesStore.clear().then(() => {
        return knownFilesStore.set(fileObjects)
      })
    }

    return Promise.resolve()
  }

  function migrateKnownFileStore() {
    return knownFilesStore
      .currentStore()
      .then(oldMigration)
      .then(() => {
        return knownFilesStore
          .some((value, key) => {
            return typeof key !== 'string' || !helpers.file.isProtocolString(key)
          })
          .then((needsToBeReKeyed) => {
            if (needsToBeReKeyed) {
              logger.info(
                'Migrating the known files store because we found a key that is not a file URL.'
              )
              return knownFilesStore.currentStore().then((currentStore) => {
                return knownFilesStore.set(migrateKnownFilesStoreObject(currentStore))
              })
            }
            return true
          })
      })
  }

  function migrateTempFilesStore() {
    return tempFilesStore.currentStore().then(() => {
      return tempFilesStore
        .some((value, key) => {
          return typeof key !== 'string' || !helpers.file.isProtocolString(key)
        })
        .then((needsToBeReKeyed) => {
          if (needsToBeReKeyed) {
            logger.info(
              'Migrating the temp files store because we found a key that is not a file URL.'
            )
            return tempFilesStore.currentStore().then((currentStore) => {
              return tempFilesStore.set(migrateTempFilesStore(currentStore))
            })
          }
          return true
        })
    })
  }

  migrateKnownFileStore()
  migrateTempFilesStore()

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
    tempFilesStore,
    lastOpenedFileStore,
  }
}

export default makeStores

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

const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
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
const LAST_OPENED_NAME = process.env.NODE_ENV == 'development' ? 'last_opened_dev' : 'last_opened'

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

const makeStores = (userDataPath, logger) => {
  const trialStore = new Store(userDataPath, logger, { name: TRIAL_INFO_PATH, watch: true })
  const licenseStore = new Store(userDataPath, logger, { name: USER_INFO_PATH, watch: true })
  const knownFilesStore = new Store(userDataPath, logger, { name: knownFilesPath, watch: true })
  const tempFilesStore = new Store(userDataPath, logger, {
    name: tempPath,
    watch: true,
  })
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
  const manifestStore = new Store(userDataPath, logger, { name: manifestPath, watch: true })
  const USER = new Store(userDataPath, logger, { name: USER_INFO_PATH, watch: true })

  const settingsStorePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'
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
            return tempFilesStore.map((value, key) => {
              logger.info('Migrating temp file entry', value, key)
              if (!value.filePath && !value.fileURL) {
                return {
                  [key]: value,
                }
              }
              const fileURL = value.fileURL || helpers.file.filePathToFileURL(value.path)
              if (!fileURL) {
                logger.info(
                  `Migrating known file entry {${key}: ${value}}, but we couldn't compute the fileURL for the new store so we're dropping the key-value pair.`,
                  value,
                  key
                )
                return {}
              }

              return {
                [fileURL]: {
                  fileURL,
                  fileName: basename(helpers.file.withoutProtocol(fileURL), '.pltr'),
                },
              }
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

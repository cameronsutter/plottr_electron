import path from 'path'
import fs from 'fs'
import { sortBy } from 'lodash'

import { BACKUP_BASE_PATH, CUSTOM_TEMPLATES_PATH } from './stores'

const { readdir, mkdir, lstat } = fs.promises

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

function americanToYearFirst(dateString) {
  const [month, day, year] = dateString.split('_')
  return `${year}_${month}_${day}`
}

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

const withFromFileSystem = (backupFolder) => ({
  ...backupFolder,
  fromFileSystem: true,
})

const BACKUP_FOLDER_REGEX = /^1?[0-9]_[123]?[0-9]_[0-9][0-9][0-9][0-9]/

const fileSystemModule = (userDataPath) => {
  const BACKUP_BASE_PATH = path.join(userDataPath, 'backups')
  const TEMP_FILES_PATH = path.join(userDataPath, 'tmp')
  const customTemplatesPath = path.join(userDataPath, `${CUSTOM_TEMPLATES_PATH}.json`)

  return (stores, logger) => {
    const {
      trialStore,
      licenseStore,
      knownFilesStore,
      templatesStore,
      customTemplatesStore,
      manifestStore,
      exportConfigStore,
      SETTINGS,
      USER,
    } = stores

    const currentAppSettings = () => {
      return SETTINGS.currentStore()
    }

    function backupBasePath() {
      return currentAppSettings().then((settings) => {
        const configuredLocation = settings.user?.backupLocation
        return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
      })
    }

    function setTemplate(id, template) {
      return templatesStore.set(id, template)
    }

    function setCustomTemplate(id, template) {
      return customTemplatesStore.set(id, template)
    }

    function deleteCustomTemplate(id) {
      return customTemplatesStore.delete(id)
    }

    const listenToTrialChanges = (cb) => {
      cb(trialStore.store)
      return trialStore.onDidAnyChange.bind(trialStore)(cb)
    }
    const currentTrial = () => {
      return trialStore.currentStore()
    }
    const startTrial = (numDays = null) => {
      const day = new Date()
      const startsAt = day.getTime()
      const end = addDays(startsAt, numDays || TRIAL_LENGTH)
      const endsAt = end.getTime()
      return trialStore.set({ startsAt, endsAt, extensions: EXTENSIONS })
    }
    const extendTrialWithReset = (days) => {
      return currentTrial().then((currentInfo) => {
        if (currentInfo.hasBeenReset) {
          return true
        }

        const newEnd = addDays(currentInfo.endsAt, days)
        return trialStore
          .set('endsAt', newEnd.getTime())
          .then(() => {
            return trialStore.set('extensions', EXTENSIONS)
          })
          .then(() => {
            trialStore.set('hasBeenReset', true)
          })
      })
    }

    const listenToLicenseChanges = (cb) => {
      cb(licenseStore.store)
      return licenseStore.onDidAnyChange.bind(licenseStore)
    }
    const currentLicense = () => {
      return licenseStore.currentStore()
    }
    const deleteLicense = () => {
      return licenseStore.clear()
    }
    const saveLicenseInfo = (newLicense) => {
      return licenseStore.set(newLicense)
    }

    const listenToknownFilesChanges = (cb) => {
      const transformStore = (store) => {
        return Object.entries(store)
          .filter(([key, file]) => {
            return typeof file.path === 'string' && typeof file.lastOpened === 'number'
          })
          .map(([key, file]) => {
            return {
              ...file,
              fromFileSystem: true,
              isTempFile: file.path.includes(TEMP_FILES_PATH),
              id: key,
            }
          })
      }

      const withFileSystemAsSource = (files) => {
        return cb(transformStore(files))
      }

      cb(transformStore(knownFilesStore.store))
      return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
    }
    const currentKnownFiles = () => {
      return knownFilesStore.currentStore().then((fileIndex) => {
        return Object.entries(fileIndex).map(([key, file]) => ({
          ...file,
          fromFileSystem: true,
          isTempFile: file.path.includes(TEMP_FILES_PATH),
          id: key,
        }))
      })
    }

    const listenToTemplatesChanges = (cb) => {
      cb(templatesStore.store)
      return templatesStore.onDidAnyChange.bind(templatesStore)(cb)
    }
    const currentTemplates = () => {
      return templatesStore.currentStore()
    }

    const listenToCustomTemplatesChanges = (cb) => {
      const withTemplatesAsArray = (templates) => {
        return cb(Object.values(templates))
      }
      cb(Object.values(customTemplatesStore.store))
      return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
    }
    const currentCustomTemplates = () => {
      return customTemplatesStore.currentStore()
    }

    const listenToTemplateManifestChanges = (cb) => {
      cb(manifestStore.store)
      return manifestStore.onDidAnyChange.bind(manifestStore)(cb)
    }
    const currentTemplateManifest = () => {
      return manifestStore.currentStore()
    }

    const listenToExportConfigSettingsChanges = (cb) => {
      cb(exportConfigStore.store)
      return exportConfigStore.onDidAnyChange.bind(exportConfigStore)(cb)
    }
    const currentExportConfigSettings = () => {
      return exportConfigStore.currentStore()
    }
    const saveExportConfigSettings = (key, value) => {
      return exportConfigStore.set(key, value)
    }

    const listenToAppSettingsChanges = (cb) => {
      cb(SETTINGS.store)
      return SETTINGS.onDidAnyChange.bind(SETTINGS)(cb)
    }
    const saveAppSetting = (key, value) => {
      return SETTINGS.set(key, value)
    }

    const listenToUserSettingsChanges = (cb) => {
      cb(USER.store)
      return USER.onDidAnyChange.bind(USER)(cb)
    }
    const currentUserSettings = () => {
      return USER.currentStore()
    }

    const backupDirExists = () => {
      return backupBasePath()
        .then((basePath) => {
          return lstat(basePath).then((stats) => {
            return stats.isDirectory
          })
        })
        .catch((error) => {
          if (error.code !== 'ENOENT') {
            return Promise.reject(error)
          }
          return false
        })
    }

    const listenToBackupsChanges = (cb) => {
      let watcher = () => {}
      readBackupsDirectory((error, initialBackups) => {
        if (error) {
          logger.error('Error listening to backups changes', error)
          cb([])
        } else {
          cb(initialBackups)
        }
        backupBasePath().then((basePath) => {
          backupDirExists().then((backupDirDoesExist) => {
            const makeIfNonExistant = !backupDirDoesExist ? mkdir(basePath) : Promise.resolve(true)
            makeIfNonExistant.then(() => {
              watcher = fs.watch(basePath, (event, fileName) => {
                // Do we care about event and fileName?
                //
                // NOTE: event could be 'changed' or 'renamed'.
                readBackupsDirectory((error, newBackups) => {
                  if (error) {
                    logger.error('Failed to read backups directory', error)
                    return
                  }
                  cb(newBackups)
                })
              })
            })
          })
        })
      })

      return () => {
        watcher.close()
      }
    }
    const currentBackups = () => {
      return new Promise((resolve, reject) => {
        logger.info('Reading current backups')
        readBackupsDirectory((error, newBackups) => {
          if (error) {
            logger.error('Error reading the current backups', error)
            reject(error)
            return
          }
          resolve(newBackups.map(withFromFileSystem))
        })
      })
    }

    function readBackupsDirectory(cb) {
      backupBasePath()
        .then((basePath) => {
          return readdir(basePath)
            .then((entries) => {
              return Promise.all(
                entries
                  .filter((d) => {
                    return d[0] !== '.' && !d.includes('.pltr') && d.match(BACKUP_FOLDER_REGEX)
                  })
                  .map((entry) => {
                    return lstat(path.join(basePath, entry)).then((fileStats) => {
                      return {
                        keep: fileStats.isDirectory(),
                        payload: entry,
                      }
                    })
                  })
              ).then((results) => {
                return results.filter(({ keep }) => keep).map(({ payload }) => payload)
              })
            })
            .then((directories) => {
              return Promise.all(
                directories.map((directory) => {
                  const thisPath = path.join(basePath, directory)
                  return readdir(thisPath).then((entries) => {
                    const files = entries.filter((entry) => {
                      return entry.endsWith('.pltr')
                    })
                    return {
                      path: thisPath,
                      date: americanToYearFirst(directory),
                      backups: files,
                    }
                  })
                })
              )
            })
        })
        .then((results) => {
          cb(null, sortBy(results, (folder) => new Date(folder.date.replace(/_/g, '-'))).reverse())
        })
        .catch((error) => {
          logger.error('Error reading backup directory.', error)
          cb(error, [])
          return
        })
    }

    return {
      TEMP_FILES_PATH,
      setTemplate,
      setCustomTemplate,
      deleteCustomTemplate,
      backupBasePath,
      listenToTrialChanges,
      currentTrial,
      startTrial,
      extendTrialWithReset,
      listenToLicenseChanges,
      currentLicense,
      deleteLicense,
      saveLicenseInfo,
      listenToknownFilesChanges,
      currentKnownFiles,
      listenToTemplatesChanges,
      currentTemplates,
      listenToCustomTemplatesChanges,
      currentCustomTemplates,
      listenToTemplateManifestChanges,
      currentTemplateManifest,
      listenToExportConfigSettingsChanges,
      currentExportConfigSettings,
      saveExportConfigSettings,
      listenToAppSettingsChanges,
      currentAppSettings,
      saveAppSetting,
      listenToUserSettingsChanges,
      currentUserSettings,
      listenToBackupsChanges,
      currentBackups,
      customTemplatesPath,
    }
  }
}

export default fileSystemModule

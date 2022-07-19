import path from 'path'
import fs from 'fs'
import { sortBy } from 'lodash'

import { BACKUP_BASE_PATH } from './stores'

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
      return Promise.resolve(SETTINGS.store)
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
      return Promise.resolve(trialStore.store)
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
      return Promise.resolve(licenseStore.store)
    }
    const deleteLicense = () => {
      return licenseStore.clear()
    }
    const saveLicenseInfo = (newLicense) => {
      licenseStore.store = newLicense
      return Promise.resolve(true)
    }

    const listenToknownFilesChanges = (cb) => {
      const transformStore = (store) =>
        Object.entries(store).map(([key, file]) => ({
          ...file,
          fromFileSystem: true,
          isTempFile: file.path.includes(TEMP_FILES_PATH),
          id: key,
        }))

      const withFileSystemAsSource = (files) => {
        return cb(transformStore(files))
      }

      cb(transformStore(knownFilesStore.store))
      return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
    }
    const currentKnownFiles = () => {
      return Promise.resolve(
        Object.entries(knownFilesStore.store).map(([key, file]) => ({
          ...file,
          fromFileSystem: true,
          isTempFile: file.path.includes(TEMP_FILES_PATH),
          id: key,
        }))
      )
    }

    const listenToTemplatesChanges = (cb) => {
      cb(templatesStore.store)
      return templatesStore.onDidAnyChange.bind(templatesStore)(cb)
    }
    const currentTemplates = () => {
      return Promise.resolve(templatesStore.store)
    }

    const listenToCustomTemplatesChanges = (cb) => {
      const withTemplatesAsArray = (templates) => {
        return cb(Object.values(templates))
      }
      cb(Object.values(customTemplatesStore.store))
      return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
    }
    const currentCustomTemplates = () => {
      return Promise.resolve(Object.values(customTemplatesStore.store))
    }

    const listenToTemplateManifestChanges = (cb) => {
      cb(manifestStore.store)
      return manifestStore.onDidAnyChange.bind(manifestStore)(cb)
    }
    const currentTemplateManifest = () => {
      return Promise.resolve(manifestStore.store)
    }

    const listenToExportConfigSettingsChanges = (cb) => {
      cb(exportConfigStore.store)
      return exportConfigStore.onDidAnyChange.bind(exportConfigStore)(cb)
    }
    const currentExportConfigSettings = () => {
      return Promise.resolve(exportConfigStore.store)
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
      return Promise.resolve(USER.store)
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
      readBackupsDirectory((initialBackups) => {
        cb(initialBackups)
        backupBasePath().then((basePath) => {
          backupDirExists().then((backupDirDoesExist) => {
            const makeIfNonExistant = !backupDirDoesExist ? mkdir(basePath) : Promise.resolve(true)
            makeIfNonExistant.then(() => {
              watcher = fs.watch(basePath, (event, fileName) => {
                // Do we care about event and fileName?
                //
                // NOTE: event could be 'changed' or 'renamed'.
                readBackupsDirectory((newBackups) => {
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
        readBackupsDirectory((newBackups) => {
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
          cb(sortBy(results, (folder) => new Date(folder.date.replace(/_/g, '-'))).reverse())
        })
        .catch((error) => {
          logger.error('Error reading backup directory.', error)
          cb([])
          return
        })
    }

    return {
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
    }
  }
}

export default fileSystemModule

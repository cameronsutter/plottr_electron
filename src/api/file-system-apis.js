import fs from 'fs'
import path from 'path'
import { sortBy } from 'lodash'

import {
  licenseStore,
  trialStore,
  knownFilesStore,
  templatesStore,
  customTemplatesStore,
  manifestStore,
  exportConfigStore,
  SETTINGS,
  USER,
} from '../file-system/stores'
import { backupBasePath } from '../common/utils/backup'

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

export const listenToTrialChanges = (cb) => {
  cb(trialStore.store)
  return trialStore.onDidAnyChange.bind(trialStore)(cb)
}
export const currentTrial = () => trialStore.store
export const startTrial = (numDays = null) => {
  const day = new Date()
  const startsAt = day.getTime()
  const end = addDays(startsAt, numDays || TRIAL_LENGTH)
  const endsAt = end.getTime()
  trialStore.set({ startsAt, endsAt, extensions: EXTENSIONS })
}
export const extendTrial = (days) => {
  const newEnd = addDays(Date.now(), days)
  const trialInfo = currentTrial()
  const info = {
    ...trialInfo,
    endsAt: newEnd.getTime(),
    extensions: --trialInfo.extensions,
  }
  trialStore.set(info)
}
export const extendTrialWithReset = (days) => {
  const currentInfo = currentTrial()
  if (currentInfo.hasBeenReset) return

  const newEnd = addDays(currentInfo.endsAt, days)
  trialStore.set('endsAt', newEnd.getTime())
  trialStore.set('extensions', EXTENSIONS)
  trialStore.set('hasBeenReset', true)
}

export const listenToLicenseChanges = (cb) => {
  cb(licenseStore.store)
  return licenseStore.onDidAnyChange.bind(licenseStore)
}
export const currentLicense = () => licenseStore.store
// FIXME: known issue: if we remove the license, then the listener
// stops firing.  This might be fixed in the next release.
export const deleteLicense = () => {
  licenseStore.clear()
}
export const saveLicenseInfo = (newLicense) => {
  licenseStore.store = newLicense
}

export const listenToknownFilesChanges = (cb) => {
  const withFileSystemAsSource = (files) => {
    return cb(
      Object.entries(files).map(([key, file]) => ({
        ...file,
        fromFileSystem: true,
        id: key,
      }))
    )
  }
  cb(
    Object.entries(knownFilesStore.store).map(([key, file]) => ({
      ...file,
      fromFileSystem: true,
      id: key,
    }))
  )
  return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
}
export const currentKnownFiles = () => Object.values(knownFilesStore.store)

export const listenToTemplatesChanges = (cb) => {
  cb(templatesStore.store)
  return templatesStore.onDidAnyChange.bind(templatesStore)(cb)
}
export const currentTemplates = () => templatesStore.store

export const listenToCustomTemplatesChanges = (cb) => {
  const withTemplatesAsArray = (templates) => {
    return cb(Object.values(templates))
  }
  cb(withTemplatesAsArray(customTemplatesStore.store))
  return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
}
export const currentCustomTemplates = () => Object.values(customTemplatesStore.store)

export const listenToTemplateManifestChanges = (cb) => {
  cb(manifestStore.store)
  return manifestStore.onDidAnyChange.bind(manifestStore)(cb)
}
export const currentTemplateManifest = () => manifestStore.store

export const listenToExportConfigSettingsChanges = (cb) => {
  cb(exportConfigStore.store)
  return exportConfigStore.onDidAnyChange.bind(exportConfigStore)(cb)
}
export const currentExportConfigSettings = () => exportConfigStore.store
export const saveExportConfigSettings = (key, value) => exportConfigStore.set(key, value)

export const listenToAppSettingsChanges = (cb) => {
  cb(SETTINGS.store)
  return SETTINGS.onDidAnyChange.bind(SETTINGS)(cb)
}
export const currentAppSettings = () => SETTINGS.store
export const saveAppSetting = (key, value) => SETTINGS.set(key, value)

export const listenToUserSettingsChanges = (cb) => {
  cb(USER.store)
  return USER.onDidAnyChange.bind(USER)(cb)
}
export const currentUserSettings = () => USER.store

const withFromFileSystem = (backupFolder) => ({
  ...backupFolder,
  fromFileSystem: true,
})

let _currentBackups = []
export const listenToBackupsChanges = (cb) => {
  let watcher = () => {}
  readBackupsDirectory((initialBackups) => {
    _currentBackups = initialBackups
    cb(initialBackups)
    watcher = fs.watch(backupBasePath(), (event, fileName) => {
      // Do we care about event and fileName?
      //
      // NOTE: event could be 'changed' or 'renamed'.
      readBackupsDirectory((newBackups) => {
        _currentBackups = newBackups
        cb(newBackups)
      })
    })
  })

  return () => {
    watcher.close()
  }
}
export const currentBackups = () => {
  readBackupsDirectory((newBackups) => {
    _currentBackups = newBackups.map(withFromFileSystem)
  })

  return _currentBackups
}
function readBackupsDirectory(cb) {
  fs.readdir(backupBasePath(), (err, directories) => {
    const filteredDirs = directories.filter((d) => {
      return d[0] != '.' && !d.includes('.pltr')
    })
    let tempList = []
    filteredDirs.forEach((dir) => {
      const thisPath = path.join(backupBasePath(), dir)
      // FIXME: readdir is async, it doesn't make sense to call the
      // callback inside of it :/
      fs.readdir(thisPath, (error, backupFiles) => {
        tempList.push({
          path: thisPath,
          date: dir,
          backups: backupFiles,
        })
        cb(sortBy(tempList, (a) => new Date(a.date.replace(/_/g, '-'))).reverse())
      })
    })
  })
}

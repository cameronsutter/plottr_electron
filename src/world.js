import { groupBy, flatten } from 'lodash'

import { plottrWorldAPI } from 'plottr_world'

import { fileSystemAPIs, firebaseAPIs } from './api'

const {
  listenToTrialChanges,
  currentTrial,
  listenToLicenseChanges,
  currentLicense,
  listenToTemplatesChanges,
  currentTemplates,
  listenToTemplateManifestChanges,
  currentTemplateManifest,
  listenToExportConfigSettingsChanges,
  currentExportConfigSettings,
  listenToAppSettingsChanges,
  currentAppSettings,
  listenToUserSettingsChanges,
  currentUserSettings,
} = fileSystemAPIs

const listenToknownFilesChanges = (cb) => {
  let _currentKnownFilesFromFileSystem = null
  let _currentKnownFilesFromFirebase = null

  const unsubscribeFromFileSystemKnownFiles = fileSystemAPIs.listenToknownFilesChanges(
    (knownFilesFromFileSystem) => {
      _currentKnownFilesFromFileSystem = knownFilesFromFileSystem
      if (_currentKnownFilesFromFirebase) {
        cb(_currentKnownFilesFromFileSystem.concat(_currentKnownFilesFromFirebase))
      }
    }
  )

  const unsubscribeFromFirebaseKnownFiles = firebaseAPIs.listenToKnownFiles(
    (knownFilesFromFirebase) => {
      _currentKnownFilesFromFirebase = knownFilesFromFirebase
      if (_currentKnownFilesFromFileSystem) {
        cb(_currentKnownFilesFromFileSystem.concat(_currentKnownFilesFromFirebase))
      }
    }
  )

  return () => {
    unsubscribeFromFileSystemKnownFiles()
    unsubscribeFromFirebaseKnownFiles()
  }
}

const currentKnownFiles = (cb) => {
  return fileSystemAPIs.currentKnownFiles().concat(firebaseAPIs.currentKnownFiles())
}

const listenToCustomTemplatesChanges = (cb) => {
  let _customTemplatesFromFileSystem = null
  let _customTemplatesFromFirebase = null

  const unsubscribeFromFileSystemCustomTemplates = fileSystemAPIs.listenToCustomTemplatesChanges(
    (customTemplatesFromFileSystem) => {
      _customTemplatesFromFileSystem = customTemplatesFromFileSystem
      if (_customTemplatesFromFirebase) {
        cb(_customTemplatesFromFileSystem.concat(_customTemplatesFromFirebase))
      }
    }
  )

  const unsubscribeFromFirebaseCustomTemplateChanges = firebaseAPIs.listenToCustomTemplates(
    (customTemplatesFromFirebase) => {
      _customTemplatesFromFirebase = customTemplatesFromFirebase
      if (_customTemplatesFromFileSystem) {
        cb(_customTemplatesFromFileSystem.concat(_customTemplatesFromFirebase))
      }
    }
  )

  return () => {
    unsubscribeFromFileSystemCustomTemplates()
    unsubscribeFromFirebaseCustomTemplateChanges()
  }
}
const currentCustomTemplates = () => {
  return fileSystemAPIs.currentCustomTemplates().concat(firebaseAPIs.currentCustomTemplates())
}

const mergeBackups = (firebaseFolders, localFolders) => {
  const allFolders = firebaseFolders
    .map((folder) => ({ ...folder, date: folder.path }))
    .concat(localFolders)
  const grouped = groupBy(allFolders, 'date')
  const results = []
  Object.entries(grouped).forEach(([key, group]) => {
    results.push({
      date: key,
      path: group[0].path,
      backups: flatten(group.map(({ backups }) => backups)),
    })
  })
  return results
}
const listenToBackupsChanges = (cb) => {
  let _backupsFromFileSystem = null
  let _backupsFromFirebase = null

  const unsubscribeFromFileSystemBackups = fileSystemAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFileSystem = backups
    if (_backupsFromFirebase) {
      cb(mergeBackups(_backupsFromFirebase, _backupsFromFileSystem))
    }
  })

  const unsubscribeFromFirebaseBackups = firebaseAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFirebase = backups
    if (_backupsFromFileSystem) {
      cb(mergeBackups(_backupsFromFirebase, _backupsFromFileSystem))
    }
  })

  return () => {
    unsubscribeFromFileSystemBackups()
    unsubscribeFromFirebaseBackups()
  }
}

const currentBackups = () => {
  return fileSystemAPIs.currentBackups().concat(firebaseAPIs.currentBackups())
}

const theWorld = {
  license: {
    listenToTrialChanges,
    currentTrial,
    listenToLicenseChanges,
    currentLicense,
  },
  files: {
    listenToknownFilesChanges,
    currentKnownFiles,
  },
  backups: {
    listenToBackupsChanges,
    currentBackups,
  },
  templates: {
    listenToTemplatesChanges,
    currentTemplates,
    listenToCustomTemplatesChanges,
    currentCustomTemplates,
    listenToTemplateManifestChanges,
    currentTemplateManifest,
  },
  settings: {
    listenToExportConfigSettingsChanges,
    currentExportConfigSettings,
    listenToAppSettingsChanges,
    currentAppSettings,
    listenToUserSettingsChanges,
    currentUserSettings,
  },
}

const world = plottrWorldAPI(theWorld)

export default world

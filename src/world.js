import { groupBy, flatten } from 'lodash'

import { plottrWorldAPI } from 'plottr_world'

import { fileSystemAPIs, firebaseAPIs } from './api'

const {
  listenToTrialChanges,
  currentTrial,
  listenToLicenseChanges,
  currentLicense,
  listenToknownFilesChanges,
  currentKnownFiles,
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

const listenToCustomTemplatesChanges = (cb) => {
  let _customTemplatesFromFileSystem = []
  let _customTemplatesFromFirebase = []

  const unsubscribeToFileSystemCustomTemplates = fileSystemAPIs.listenToCustomTemplatesChanges(
    (customTemplatesFromFileSystem) => {
      _customTemplatesFromFileSystem = customTemplatesFromFileSystem
      cb(customTemplatesFromFileSystem.concat(_customTemplatesFromFirebase))
    }
  )
  const unsubscribeFromFirebaseCustomTemplateChanges = firebaseAPIs.listenToCustomTemplates(
    (customTemplatesFromFirebase) => {
      _customTemplatesFromFirebase = customTemplatesFromFirebase
      cb(_customTemplatesFromFileSystem.concat(customTemplatesFromFirebase))
    }
  )
  return () => {
    unsubscribeToFileSystemCustomTemplates()
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
  let _backupsFromFileSystem = []
  let _backupsFromFirebase = []

  const unsubscribeFromFileSystemBackups = fileSystemAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFileSystem = backups
    cb(mergeBackups(_backupsFromFirebase, backups))
  })
  const unsubscribeFromFirebaseBackups = firebaseAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFirebase = backups
    cb(mergeBackups(backups, _backupsFromFileSystem))
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

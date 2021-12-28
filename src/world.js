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

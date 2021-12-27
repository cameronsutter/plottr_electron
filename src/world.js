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
  let unsubscribeFromFirebaseCustomTemplateChanges = () => {}
  const unsubscribeToFileSystemCustomTemplates = fileSystemAPIs.listenToCustomTemplatesChanges(
    (customTemplatesFromFileSystem) => {
      unsubscribeFromFirebaseCustomTemplateChanges = firebaseAPIs.listenToCustomTemplates(
        (customTemplatesFromFirebase) => {
          cb(customTemplatesFromFileSystem.concat(customTemplatesFromFirebase))
        }
      )
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

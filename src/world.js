import { plottrWorldAPI } from 'plottr_world'

import { fileSystemAPIs } from './api'

const {
  listenToTrialChanges,
  currentTrial,
  listenToLicenseChanges,
  currentLicense,
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
  listenToAppSettingsChanges,
  currentAppSettings,
  listenToUserSettingsChanges,
  currentUserSettings,
} = fileSystemAPIs

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

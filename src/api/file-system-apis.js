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

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrial = () => trialStore.store

export const listenToLicenseChanges = licenseStore.onDidAnyChange.bind(licenseStore)
export const currentLicense = () => licenseStore.store

export const listenToknownFilesChanges = knownFilesStore.onDidAnyChange.bind(knownFilesStore)
export const currentKnownFiles = () => knownFilesStore.store

export const listenToTemplatesChanges = templatesStore.onDidAnyChange.bind(templatesStore)
export const currentTemplates = () => templatesStore.store

export const listenToCustomTemplatesChanges =
  customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)
export const currentCustomTemplates = () => customTemplatesStore.store

export const listenToTemplateManifestChanges = manifestStore.onDidAnyChange.bind(manifestStore)
export const currentTemplateManifest = () => manifestStore.store

export const listenToExportConfigSettingsChanges =
  exportConfigStore.onDidAnyChange.bind(exportConfigStore)
export const currentExportConfigSettings = () => exportConfigStore.store
export const setExportConfigSettings = (key, value) => exportConfigStore.set(key, value)

export const listenToAppSettingsChanges = SETTINGS.onDidAnyChange.bind(SETTINGS)
export const currentAppSettings = () => SETTINGS.store

export const listenToUserSettingsChanges = USER.onDidAnyChange.bind(USER)
export const currentUserSettings = () => USER.store

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

export const listenToCustomTemplatesChanges = (cb) => {
  const withTemplatesAsArray = (templates) => {
    return cb(Object.values(templates))
  }
  return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
}
export const currentCustomTemplates = () => Object.values(customTemplatesStore.store)

export const listenToTemplateManifestChanges = manifestStore.onDidAnyChange.bind(manifestStore)
export const currentTemplateManifest = () => manifestStore.store

export const listenToExportConfigSettingsChanges =
  exportConfigStore.onDidAnyChange.bind(exportConfigStore)
export const currentExportConfigSettings = () => exportConfigStore.store
export const saveExportConfigSettings = (key, value) => exportConfigStore.set(key, value)

export const listenToAppSettingsChanges = SETTINGS.onDidAnyChange.bind(SETTINGS)
export const currentAppSettings = () => SETTINGS.store
export const saveAppSetting = (key, value) => SETTINGS.set(key, value)

export const listenToUserSettingsChanges = USER.onDidAnyChange.bind(USER)
export const currentUserSettings = () => USER.store

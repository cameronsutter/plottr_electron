import {
  licenseStore,
  trialStore,
  knownFilesStore,
  templatesStore,
  customTemplatesStore,
  manifestStore,
} from '../file-system/stores'

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrialValue = () => trialStore.store

export const listenToLicenseChanges = licenseStore.onDidAnyChange.bind(licenseStore)
export const currentLicenseValue = () => licenseStore.store

export const listenToknownFilesChanges = knownFilesStore.onDidAnyChange.bind(knownFilesStore)
export const currentKnownFiles = () => knownFilesStore.store

export const listenToTemplatesChanges = templatesStore.onDidAnyChange.bind(templatesStore)
export const currentTemplates = () => templatesStore.store

export const listenToCustomTemplatesChanges =
  customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)
export const currentCustomTemplates = () => customTemplatesStore.store

export const listenToTemplateManifestChanges = manifestStore.onDidAnyChange.bind(manifestStore)
export const currentTemplateManifest = () => manifestStore.store

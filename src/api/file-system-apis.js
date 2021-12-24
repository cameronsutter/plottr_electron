import { licenseStore, trialStore, knownFilesStore } from '../file-system/stores'

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrialValue = () => trialStore.store

export const listenToLicenseChanges = licenseStore.onDidAnyChange.bind(licenseStore)
export const currentLicenseValue = () => licenseStore.store

export const listenToknownFilesChanges = knownFilesStore.onDidAnyChange.bind(knownFilesStore)
export const currentKnownFiles = () => knownFilesStore.store

import { licenseStore, trialStore } from '../file-system/stores'

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrialValue = () => trialStore.store

export const listenToLicenseChanges = licenseStore.onDidAnyChange.bind(licenseStore)
export const currentLicenseValue = () => licenseStore.store

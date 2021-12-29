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

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrial = () => trialStore.store
export const startTrial = (numDays = null) => {
  const day = new Date()
  const startsAt = day.getTime()
  const end = addDays(startsAt, numDays || TRIAL_LENGTH)
  const endsAt = end.getTime()
  trialStore.set({ startsAt, endsAt, extensions: EXTENSIONS })
}
export const extendTrial = (days) => {
  const newEnd = addDays(Date.now(), days)
  const trialInfo = currentTrial()
  const info = {
    ...trialInfo,
    endsAt: newEnd.getTime(),
    extensions: --trialInfo.extensions,
  }
  trialStore.set(info)
}
export const extendTrialWithReset = (days) => {
  const currentInfo = currentTrial()
  if (currentInfo.hasBeenReset) return

  const newEnd = addDays(currentInfo.endsAt, days)
  trialStore.set('endsAt', newEnd.getTime())
  trialStore.set('extensions', EXTENSIONS)
  trialStore.set('hasBeenReset', true)
}

export const listenToLicenseChanges = licenseStore.onDidAnyChange.bind(licenseStore)
export const currentLicense = () => licenseStore.store
// FIXME: known issue: if we remove the license, then the listener
// stops firing.  This might be fixed in the next release.
export const deleteLicense = () => {
  licenseStore.clear()
}
export const saveLicenseInfo = (newLicense) => {
  licenseStore.store = newLicense
}

export const listenToknownFilesChanges = (cb) => {
  const withFileSystemAsSource = (files) => {
    return cb(
      files.map((file) => ({
        ...file,
        fromFileSystem: true,
      }))
    )
  }
  return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
}
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

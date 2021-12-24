import { actions } from 'pltr/v2'

import { fileSystemAPIs } from '../api'

export const publishTrialChangesToRedux = (store) => {
  const action = actions.license.setTrialInfo
  store.dispatch(action(fileSystemAPIs.currentTrialValue()))
  return fileSystemAPIs.listenToTrialChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishLicenseChangesToRedux = (store) => {
  const action = actions.license.setLicenseInfo
  store.dispatch(action(fileSystemAPIs.currentLicenseValue()))
  return fileSystemAPIs.listenToLicenseChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishKnownFilesChangesToRedux = (store) => {
  const action = actions.knownFiles.setKnownFiles
  store.dispatch(action(fileSystemAPIs.currentKnownFiles()))
  return fileSystemAPIs.listenToknownFilesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishTemplatesChangesToRedux = (store) => {
  const action = actions.templates.setTemplates
  store.dispatch(action(fileSystemAPIs.currentTemplates()))
  return fileSystemAPIs.listenToTemplatesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishCustomTemplatesChangesToRedux = (store) => {
  const action = actions.templates.setCustomTemplates
  store.dispatch(action(fileSystemAPIs.currentCustomTemplates()))
  return fileSystemAPIs.listenToCustomTemplatesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishTemplateManifestChangesToRedux = (store) => {
  const action = actions.templates.setTemplateManifest
  store.dispatch(action(fileSystemAPIs.currentTemplateManifest()))
  return fileSystemAPIs.listenToTemplateManifestChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishExportConfigChangesToRedux = (store) => {
  const action = actions.settings.setExportSettings
  store.dispatch(action(fileSystemAPIs.currentExportConfig()))
  return fileSystemAPIs.listenToExportConfigSettingsChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishAppSettingsChangesToRedux = (store) => {
  const action = actions.settings.setAppSettings
  store.dispatch(action(fileSystemAPIs.currentAppSettings()))
  return fileSystemAPIs.listenToAppSettingsChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishUserSettingsChangesToRedux = (store) => {
  const action = actions.settings.setUserSettings
  store.dispatch(action(fileSystemAPIs.currentUserSettings()))
  return fileSystemAPIs.listenToUserSettingsChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

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

import * as fileSystemListeners from './file-system-listeners'

const connectListenersToRedux = (store) => {
  const unsubscribeToTrialChanges = fileSystemListeners.publishTrialChangesToRedux(store)
  const unsubscribeToLicenseChanges = fileSystemListeners.publishLicenseChangesToRedux(store)
  const unsubscribeToKnownFilesChanges = fileSystemListeners.publishKnownFilesChangesToRedux(store)
  const unsubscribeToTemplatesChanges = fileSystemListeners.publishTemplatesChangesToRedux(store)
  const unsubscribeToCustomTemplatesChanges =
    fileSystemListeners.publishCustomTemplatesChangesToRedux(store)
  const unsubscribeToTemplateManifestChanges =
    fileSystemListeners.publishTemplateManifestChangesToRedux(store)
  const unsubscribeToExportConfigChanges =
    fileSystemListeners.publishExportConfigChangesToRedux(store)
  const unsubscribetoAppSettingsChanges =
    fileSystemListeners.publishAppSettingsChangesToRedux(store)
  const unsubscribeToUserSettingsChanges =
    fileSystemListeners.publishUserSettingsChangesToRedux(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
    unsubscribeToKnownFilesChanges()
    unsubscribeToTemplatesChanges()
    unsubscribeToCustomTemplatesChanges()
    unsubscribeToTemplateManifestChanges()
    unsubscribeToExportConfigChanges()
    unsubscribetoAppSettingsChanges()
    unsubscribeToUserSettingsChanges()
  }
}

export default connectListenersToRedux

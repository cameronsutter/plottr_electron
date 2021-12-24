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

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
    unsubscribeToKnownFilesChanges()
    unsubscribeToTemplatesChanges()
    unsubscribeToCustomTemplatesChanges()
    unsubscribeToTemplateManifestChanges()
  }
}

export default connectListenersToRedux

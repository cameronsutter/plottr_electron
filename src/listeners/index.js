import * as fileSystemListeners from './file-system-listeners'

const connectListenersToRedux = (store) => {
  const unsubscribeToTrialChanges = fileSystemListeners.publishTrialChangesToRedux(store)
  const unsubscribeToLicenseChanges = fileSystemListeners.publishLicenseChangesToRedux(store)
  const unsubscribeToKnownFilesChanges = fileSystemListeners.publishKnownFilesChangesToRedux(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
    unsubscribeToKnownFilesChanges()
  }
}

export default connectListenersToRedux

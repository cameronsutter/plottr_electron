import { actions } from 'pltr/v2'

const publishTrialChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setTrialInfo
  theWorld.license
    .currentTrial()
    .then((currentTrial) => {
      store.dispatch(action(currentTrial))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current trial`, error)
    })
  store.dispatch(actions.applicationState.finishLoadingALicenseType('trial'))
  return theWorld.license.listenToTrialChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishLicenseChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setLicenseInfo
  theWorld.license
    .currentLicense()
    .then((currentLicense) => {
      store.dispatch(action(currentLicense))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current license`, error)
    })
  store.dispatch(actions.applicationState.finishLoadingALicenseType('license'))
  return theWorld.license.listenToLicenseChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startLoadingALicenseType('trial'))
  const unsubscribeToTrialChanges = publishTrialChangesToStore(theWorld)(store)
  store.dispatch(actions.applicationState.startLoadingALicenseType('license'))
  const unsubscribeToLicenseChanges = publishLicenseChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
  }
}

export default publishChangesToStore

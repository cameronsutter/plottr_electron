import { actions } from 'pltr/v2'

const publishTrialChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setTrialInfo
  store.dispatch(action(theWorld.license.currentTrial()))
  store.dispatch(actions.applicationState.finishLoadingALicenseType('trial'))
  return theWorld.license.listenToTrialChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishLicenseChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setLicenseInfo
  store.dispatch(action(theWorld.license.currentLicense()))
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

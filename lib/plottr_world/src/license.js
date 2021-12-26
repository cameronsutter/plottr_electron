import { actions } from 'pltr/v2'

const publishTrialChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setTrialInfo
  store.dispatch(action(theWorld.license.currentTrial()))
  return theWorld.license.listenToTrialChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishLicenseChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setLicenseInfo
  store.dispatch(action(theWorld.license.currentLicense()))
  return theWorld.license.listenToLicenseChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToTrialChanges = publishTrialChangesToStore(theWorld)(store)
  const unsubscribeToLicenseChanges = publishLicenseChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
  }
}

export default publishChangesToStore

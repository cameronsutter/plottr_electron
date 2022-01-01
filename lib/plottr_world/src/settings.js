import { actions } from 'pltr/v2'

export const publishExportConfigChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setExportSettings
  store.dispatch(actions.applicationState.startLoadingASettingsType('exportConfig'))
  store.dispatch(action(theWorld.settings.currentExportConfigSettings()))
  store.dispatch(actions.applicationState.finishLoadingASettingsType('exportConfig'))
  return theWorld.settings.listenToExportConfigSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishAppSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setAppSettings
  store.dispatch(actions.applicationState.startLoadingASettingsType('settings'))
  store.dispatch(action(theWorld.settings.currentAppSettings()))
  store.dispatch(actions.applicationState.finishLoadingASettingsType('settings'))
  return theWorld.settings.listenToAppSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishUserSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setUserSettings
  store.dispatch(action(theWorld.settings.currentUserSettings()))
  return theWorld.settings.listenToUserSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToExportConfigChanges = publishExportConfigChangesToStore(theWorld)(store)
  const unsubscribetoAppSettingsChanges = publishAppSettingsChangesToStore(theWorld)(store)
  const unsubscribeToUserSettingsChanges = publishUserSettingsChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToExportConfigChanges()
    unsubscribetoAppSettingsChanges()
    unsubscribeToUserSettingsChanges()
  }
}

export default publishChangesToStore

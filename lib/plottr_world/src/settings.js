import { actions } from 'pltr/v2'

export const publishExportConfigChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setExportSettings
  store.dispatch(action(theWorld.settings.currentExportConfigSettings()))
  return theWorld.settings.listenToExportConfigSettingsChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishAppSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setAppSettings
  store.dispatch(action(theWorld.settings.currentAppSettings()))
  return theWorld.settings.listenToAppSettingsChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishUserSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setUserSettings
  store.dispatch(action(theWorld.settings.currentUserSettings()))
  return theWorld.settings.listenToUserSettingsChanges((newValue, oldValue) => {
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

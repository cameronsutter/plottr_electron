import { actions } from 'pltr/v2'

export const publishExportConfigChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setExportSettings
  theWorld.settings
    .currentExportConfigSettings()
    .then((currentSettings) => {
      store.dispatch(action(currentSettings))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current export config`, error)
    })
  store.dispatch(actions.applicationState.finishLoadingASettingsType('exportConfig'))
  return theWorld.settings.listenToExportConfigSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishAppSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setAppSettings
  theWorld.settings
    .currentAppSettings()
    .then((currentAppSettings) => {
      store.dispatch(action(currentAppSettings))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current app settings`, error)
    })
  store.dispatch(actions.applicationState.finishLoadingASettingsType('settings'))
  return theWorld.settings.listenToAppSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishUserSettingsChangesToStore = (theWorld) => (store) => {
  const action = actions.settings.setUserSettings
  theWorld.settings
    .currentUserSettings()
    .then((currentUserSettings) => {
      store.dispatch(action(currentUserSettings))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current user settings`, error)
    })
  return theWorld.settings.listenToUserSettingsChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startLoadingASettingsType('settings'))
  const unsubscribetoAppSettingsChanges = publishAppSettingsChangesToStore(theWorld)(store)
  store.dispatch(actions.applicationState.startLoadingASettingsType('exportConfig'))
  const unsubscribeToExportConfigChanges = publishExportConfigChangesToStore(theWorld)(store)
  const unsubscribeToUserSettingsChanges = publishUserSettingsChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToExportConfigChanges()
    unsubscribetoAppSettingsChanges()
    unsubscribeToUserSettingsChanges()
  }
}

export default publishChangesToStore

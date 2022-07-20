import { actions } from 'pltr/v2'

export const publishTemplatesChangesToStore = (theWorld) => (store) => {
  const action = actions.templates.setTemplates
  theWorld.templates
    .currentTemplates()
    .then((currentTemplates) => {
      store.dispatch(action(currentTemplates))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current templates`, error)
    })
  return theWorld.templates.listenToTemplatesChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishCustomTemplatesChangesToStore = (theWorld) => (store) => {
  const action = actions.templates.setCustomTemplates
  theWorld.templates
    .currentCustomTemplates()
    .then((currentCustomTemplates) => {
      store.dispatch(action(currentCustomTemplates))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current custom templates`, error)
    })
  return theWorld.templates.listenToCustomTemplatesChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishTemplateManifestChangesToRedux = (theWorld) => (store) => {
  const action = actions.templates.setTemplateManifest
  theWorld.templates
    .currentTemplateManifest()
    .then((currentTemplateManifest) => {
      store.dispatch(action(currentTemplateManifest))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current template manifest`, error)
    })
  return theWorld.templates.listenToTemplateManifestChanges(store, (newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToTemplatesChanges = publishTemplatesChangesToStore(theWorld)(store)
  const unsubscribeToCustomTemplatesChanges = publishCustomTemplatesChangesToStore(theWorld)(store)
  const unsubscribeToTemplateManifestChanges =
    publishTemplateManifestChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToTemplatesChanges()
    unsubscribeToCustomTemplatesChanges()
    unsubscribeToTemplateManifestChanges()
  }
}

export default publishChangesToStore

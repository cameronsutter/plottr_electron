import { actions } from 'pltr/v2'

export const publishTemplatesChangesToStore = (theWorld) => (store) => {
  const action = actions.templates.setTemplates
  store.dispatch(action(theWorld.templates.currentTemplates()))
  return theWorld.templates.listenToTemplatesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishCustomTemplatesChangesToStore = (theWorld) => (store) => {
  const action = actions.templates.setCustomTemplates
  store.dispatch(action(theWorld.templates.currentCustomTemplates()))
  return theWorld.templates.listenToCustomTemplatesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

export const publishTemplateManifestChangesToRedux = (theWorld) => (store) => {
  const action = actions.templates.setTemplateManifest
  store.dispatch(action(theWorld.templates.currentTemplateManifest()))
  return theWorld.templates.listenToTemplateManifestChanges((newValue, oldValue) => {
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

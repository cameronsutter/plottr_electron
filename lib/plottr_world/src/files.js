import { actions } from 'pltr/v2'

export const publishKnownFilesChangesToRedux = (theWorld) => (store) => {
  const action = actions.knownFiles.setKnownFiles
  store.dispatch(action(theWorld.files.currentKnownFiles()))
  return theWorld.files.listenToknownFilesChanges((newValue, oldValue) => {
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToKnownFilesChanges = publishKnownFilesChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToKnownFilesChanges()
  }
}

export default publishChangesToStore

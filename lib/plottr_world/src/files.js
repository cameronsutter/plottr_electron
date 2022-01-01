import { actions, selectors } from 'pltr/v2'

export const publishKnownFilesChangesToRedux = (theWorld) => (store) => {
  const action = actions.knownFiles.setKnownFiles
  store.dispatch(action(theWorld.files.currentKnownFiles()))
  return theWorld.files.listenToknownFilesChanges(store, (newValue, oldValue) => {
    if (selectors.fileListIsLoadingSelector(store.getState().present)) {
      store.dispatch(actions.applicationState.finishLoadingFileList())
    }
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startLoadingFileList())
  const unsubscribeToKnownFilesChanges = publishKnownFilesChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToKnownFilesChanges()
  }
}

export default publishChangesToStore

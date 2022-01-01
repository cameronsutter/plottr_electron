import { actions } from 'pltr/v2'

export const publishBackupsChangesToRedux = (theWorld) => (store) => {
  const action = actions.backups.setBackupFolders
  store.dispatch(action(theWorld.backups.currentBackups()))
  return theWorld.backups.listenToBackupsChanges(store, (newBackups) => {
    store.dispatch(action(newBackups))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToBackupsChanges = publishBackupsChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToBackupsChanges()
  }
}

export default publishChangesToStore

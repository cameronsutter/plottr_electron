import { actions } from 'pltr/v2'

export const publishBackupsChangesToRedux = (theWorld) => (store) => {
  const action = actions.backups.setBackupFolders
  theWorld.backups
    .currentBackups()
    .then((backups) => {
      store.dispatch(action(backups))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current backups`, error)
    })
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

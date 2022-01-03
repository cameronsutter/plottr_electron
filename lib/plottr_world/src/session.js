import { actions } from 'pltr/v2'

const publishSessionChangesToStore = (theWorld) => (store) => {
  const setUserId = actions.client.setUserId
  const setEmailAddress = actions.client.setEmailAddress
  return theWorld.session.listenForSessionChange(({ uid, email }) => {
    store.dispatch(setUserId(uid))
    store.dispatch(setEmailAddress(email))
    store.dispatch(actions.applicationState.finishCheckingSession())
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startCheckingSession())
  const unsubscribeToSessionChanges = publishSessionChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToSessionChanges()
  }
}

export default publishChangesToStore

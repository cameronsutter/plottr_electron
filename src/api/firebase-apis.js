import {
  onSessionChange,
  listenToCustomTemplates as listenToCustomTemplatesFromFirebase,
} from 'wired-up-firebase'

const annotateTemplate = (template) => ({
  ...template,
  isCloudTemplate: true,
})

let _currentCustomTemplates = []
const listenToCustomTemplates = (cb) => {
  let unsubscribeFromCustomTemplates = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    if (user) {
      unsubscribeFromCustomTemplates = listenToCustomTemplatesFromFirebase(
        user.uid,
        (newTemplates) => {
          const annotatedTemplates = newTemplates.map(annotateTemplate)
          _currentCustomTemplates = annotatedTemplates
          cb(annotatedTemplates)
        }
      )
    }
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromCustomTemplates()
  }
}

const currentCustomTemplates = () => {
  return _currentCustomTemplates
}

export { listenToCustomTemplates, currentCustomTemplates }

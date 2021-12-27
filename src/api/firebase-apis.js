import {
  onSessionChange,
  listenToCustomTemplates as listenToCustomTemplatesFromFirebase,
} from 'wired-up-firebase'

const annotateTemplate = (template) => ({
  ...template,
  isCloudTemplate: true,
})

const listenToCustomTemplates = (cb) => {
  let unsubscribeFromCustomTemplates = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    unsubscribeFromCustomTemplates = listenToCustomTemplatesFromFirebase(user.uid).then(
      (newTemplates) => {
        const annotatedTemplates = newTemplates.map(annotateTemplate)
        cb(annotatedTemplates)
      }
    )
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromCustomTemplates()
  }
}

let _currentCustomTemplates = []
const currentCustomTemplates = () => {
  listenToCustomTemplates((templates) => {
    _currentCustomTemplates = templates.map(annotateTemplate)
  })()

  return _currentCustomTemplates
}

export { listenToCustomTemplates, currentCustomTemplates }

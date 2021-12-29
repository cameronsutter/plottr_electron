import { groupBy } from 'lodash'

import {
  onSessionChange,
  listenToCustomTemplates as listenToCustomTemplatesFromFirebase,
  listenForBackups as listenForBackupsFromFirebase,
} from 'wired-up-firebase'

const annotateTemplate = (template) => ({
  ...template,
  isCloudTemplate: true,
})

let _currentCustomTemplates = []
export const listenToCustomTemplates = (cb) => {
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

export const currentCustomTemplates = () => {
  return _currentCustomTemplates
}

let _currentBackups = []
export const currentBackups = () => {
  return _currentBackups
}
export const listenToBackupsChanges = (cb) => {
  let unsubscribeFromBackupsChanges = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    if (user) {
      unsubscribeFromBackupsChanges = listenForBackupsFromFirebase(user.uid, (backups) => {
        const grouped = groupBy(backups, (backup) => {
          const date = backup?.lastModified?.toDate() || new Date()
          return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`
        })
        const backupFolders = []
        Object.keys(grouped).forEach((key) => {
          backupFolders.push({
            backups: grouped[key],
            path: key,
            date: grouped[key][0]?.lastModified?.toDate() || new Date(),
            isCloudBackup: true,
          })
        })

        cb(backupFolders)
      })
    }
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromBackupsChanges()
  }
}

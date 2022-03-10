import { groupBy } from 'lodash'

import { helpers } from 'pltr/v2'
import {
  onSessionChange,
  listenToCustomTemplates as listenToCustomTemplatesFromFirebase,
  listenForBackups as listenForBackupsFromFirebase,
  listenToFiles,
} from 'wired-up-firebase'

let _currentKnownFiles = []
export const listenToKnownFiles = (cb) => {
  let unsubscribeFromKnownFiles = () => {}
  let unsubscribeFromSessionChanges = () => {}

  const startListening = () => {
    unsubscribeFromSessionChanges = onSessionChange((user) => {
      if (user) {
        unsubscribeFromKnownFiles = listenToFiles(user.uid, (newFileList) => {
          _currentKnownFiles = newFileList.filter(({ deleted }) => !deleted)
          cb(_currentKnownFiles)
        })
      }
    })
  }

  if (navigator.onLine) {
    startListening()
  }

  window.addEventListener('online', () => {
    startListening()
  })
  window.addEventListener('offline', () => {
    if (unsubscribeFromSessionChanges) {
      unsubscribeFromSessionChanges()
      unsubscribeFromSessionChanges = null
    }
  })

  return () => {
    if (unsubscribeFromSessionChanges) unsubscribeFromSessionChanges()
    unsubscribeFromKnownFiles()
  }
}

export const currentKnownFiles = () => {
  return _currentKnownFiles
}

export const listenForSessionChange = (cb) => {
  const listenOnline = (innerCB) =>
    onSessionChange((user) => {
      if (user) {
        innerCB({
          email: user.email,
          uid: user.uid,
        })
      } else {
        innerCB({
          email: null,
          uid: null,
        })
      }
    })

  let listener = listenOnline((user) => {
    cb(user)
    if (!navigator.onLine) {
      listener()
      listener = null
    }
  })

  window.addEventListener('online', () => {
    listener = listenOnline(cb)
  })
  window.addEventListener('offline', () => {
    if (listener) listener()
  })

  return () => {
    if (listener) listener()
  }
}

const annotateTemplate = (template) => ({
  ...template,
  isCloudTemplate: true,
})

let _currentCustomTemplates = []
export const listenToCustomTemplates = (cb) => {
  let unsubscribeFromCustomTemplates = () => {}
  let unsubscribeFromSessionChanges = () => {}

  const startListening = () => {
    unsubscribeFromSessionChanges = onSessionChange((user) => {
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
  }

  if (navigator.onLine) {
    startListening()
  }

  window.addEventListener('online', () => {
    startListening()
  })
  window.addEventListener('offline', () => {
    if (unsubscribeFromSessionChanges) {
      unsubscribeFromSessionChanges()
      unsubscribeFromSessionChanges = null
    }
  })

  return () => {
    if (unsubscribeFromSessionChanges) unsubscribeFromSessionChanges()
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
  let unsubscribeFromSessionChanges = () => {}

  const startListening = () => {
    unsubscribeFromSessionChanges = onSessionChange((user) => {
      if (user) {
        unsubscribeFromBackupsChanges = listenForBackupsFromFirebase(user.uid, (backups) => {
          const grouped = groupBy(backups, (backup) => {
            const date = helpers.time.convertFromNanosAndSeconds(backup?.lastModified) || new Date()
            return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`
          })
          const backupFolders = []
          Object.keys(grouped).forEach((key) => {
            backupFolders.push({
              backups: grouped[key],
              path: key,
              date: key,
              isCloudBackup: true,
            })
          })

          cb(backupFolders)
        })
      }
    })
  }

  if (navigator.onLine) {
    startListening()
  }

  window.addEventListener('online', () => {
    startListening()
  })
  window.addEventListener('offline', () => {
    if (unsubscribeFromSessionChanges) {
      unsubscribeFromSessionChanges()
      unsubscribeFromSessionChanges = null
    }
  })

  return () => {
    if (unsubscribeFromSessionChanges) unsubscribeFromSessionChanges()
    unsubscribeFromBackupsChanges()
  }
}

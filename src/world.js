import { groupBy, flatten } from 'lodash'

import { selectors } from 'pltr/v2'
import { plottrWorldAPI } from 'plottr_world'

import { fileSystemAPIs, firebaseAPIs } from './api'

const {
  listenToTrialChanges,
  currentTrial,
  listenToLicenseChanges,
  currentLicense,
  listenToTemplatesChanges,
  currentTemplates,
  listenToTemplateManifestChanges,
  currentTemplateManifest,
  listenToExportConfigSettingsChanges,
  currentExportConfigSettings,
  listenToAppSettingsChanges,
  currentAppSettings,
  listenToUserSettingsChanges,
  currentUserSettings,
} = fileSystemAPIs

// From: https://github.com/reduxjs/redux/issues/303#issuecomment-125184409
function observeStore(store, select, onChange) {
  let currentState = select(store.getState().present)

  function handleChange() {
    let nextState = select(store.getState().present)
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  let unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}

const listenToknownFilesChanges = (store, cb) => {
  let _currentKnownFilesFromFileSystem = null
  let _currentKnownFilesFromFirebase = null

  const unsubscribeFromFileSystemKnownFiles = fileSystemAPIs.listenToknownFilesChanges(
    (knownFilesFromFileSystem) => {
      _currentKnownFilesFromFileSystem = knownFilesFromFileSystem
      const checkingSettings = () => {
        const appSettingsLoaded = selectors.applicationSettingsAreLoadedSelector(
          store.getState().present
        )
        if (!appSettingsLoaded) {
          const unsubscribe = observeStore(
            store,
            selectors.applicationSettingsAreLoadedSelector,
            (loaded) => {
              if (loaded) {
                unsubscribe()
                checkingSettings()
              }
            }
          )
          return
        }

        const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(
          store.getState().present
        )
        if (_currentKnownFilesFromFirebase) {
          cb(_currentKnownFilesFromFileSystem.concat(_currentKnownFilesFromFirebase))
        } else if (!previouslyLoggedIntoPro) {
          cb(_currentKnownFilesFromFileSystem)
        }
      }
      checkingSettings()
    }
  )

  const unsubscribeFromFirebaseKnownFiles = firebaseAPIs.listenToKnownFiles(
    (knownFilesFromFirebase) => {
      _currentKnownFilesFromFirebase = knownFilesFromFirebase
      const checkingSettings = () => {
        const appSettingsLoaded = selectors.applicationSettingsAreLoadedSelector(
          store.getState().present
        )
        if (!appSettingsLoaded) {
          const unsubscribe = observeStore(
            store,
            selectors.applicationSettingsAreLoadedSelector,
            (loaded) => {
              if (loaded) {
                unsubscribe()
                checkingSettings()
              }
            }
          )
          return
        }

        const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(
          store.getState().present
        )
        if (_currentKnownFilesFromFileSystem) {
          cb(_currentKnownFilesFromFileSystem.concat(_currentKnownFilesFromFirebase))
        } else if (previouslyLoggedIntoPro) {
          cb(_currentKnownFilesFromFirebase)
        }
      }

      checkingSettings()
    }
  )

  return () => {
    unsubscribeFromFileSystemKnownFiles()
    unsubscribeFromFirebaseKnownFiles()
  }
}

const currentKnownFiles = (cb) => {
  return fileSystemAPIs.currentKnownFiles().concat(firebaseAPIs.currentKnownFiles())
}

const listenToCustomTemplatesChanges = (store, cb) => {
  let _customTemplatesFromFileSystem = null
  let _customTemplatesFromFirebase = null

  const unsubscribeFromFileSystemCustomTemplates = fileSystemAPIs.listenToCustomTemplatesChanges(
    (customTemplatesFromFileSystem) => {
      _customTemplatesFromFileSystem = customTemplatesFromFileSystem
      if (_customTemplatesFromFirebase) {
        cb(_customTemplatesFromFileSystem.concat(_customTemplatesFromFirebase))
      }
    }
  )

  const unsubscribeFromFirebaseCustomTemplateChanges = firebaseAPIs.listenToCustomTemplates(
    (customTemplatesFromFirebase) => {
      _customTemplatesFromFirebase = customTemplatesFromFirebase
      if (_customTemplatesFromFileSystem) {
        cb(_customTemplatesFromFileSystem.concat(_customTemplatesFromFirebase))
      }
    }
  )

  return () => {
    unsubscribeFromFileSystemCustomTemplates()
    unsubscribeFromFirebaseCustomTemplateChanges()
  }
}
const currentCustomTemplates = () => {
  return fileSystemAPIs.currentCustomTemplates().concat(firebaseAPIs.currentCustomTemplates())
}

const mergeBackups = (firebaseFolders, localFolders) => {
  const allFolders = firebaseFolders
    .map((folder) => ({ ...folder, date: folder.path }))
    .concat(localFolders)
  const grouped = groupBy(allFolders, 'date')
  const results = []
  Object.entries(grouped).forEach(([key, group]) => {
    results.push({
      date: key,
      path: group[0].path,
      backups: flatten(group.map(({ backups }) => backups)),
    })
  })
  return results
}
const listenToBackupsChanges = (store, cb) => {
  let _backupsFromFileSystem = null
  let _backupsFromFirebase = null

  const unsubscribeFromFileSystemBackups = fileSystemAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFileSystem = backups
    if (_backupsFromFirebase) {
      cb(mergeBackups(_backupsFromFirebase, _backupsFromFileSystem))
    }
  })

  const unsubscribeFromFirebaseBackups = firebaseAPIs.listenToBackupsChanges((backups) => {
    _backupsFromFirebase = backups
    if (_backupsFromFileSystem) {
      cb(mergeBackups(_backupsFromFirebase, _backupsFromFileSystem))
    }
  })

  return () => {
    unsubscribeFromFileSystemBackups()
    unsubscribeFromFirebaseBackups()
  }
}

const currentBackups = () => {
  return fileSystemAPIs.currentBackups().concat(firebaseAPIs.currentBackups())
}

const ignoringStore = (fn) => (store, cb) => fn(cb)

const theWorld = {
  license: {
    listenToTrialChanges: ignoringStore(listenToTrialChanges),
    currentTrial,
    listenToLicenseChanges: ignoringStore(listenToLicenseChanges),
    currentLicense,
  },
  session: {
    listenForSessionChange: ignoringStore(firebaseAPIs.listenForSessionChange),
  },
  files: {
    listenToknownFilesChanges,
    currentKnownFiles,
  },
  backups: {
    listenToBackupsChanges,
    currentBackups,
  },
  templates: {
    listenToTemplatesChanges: ignoringStore(listenToTemplatesChanges),
    currentTemplates,
    listenToCustomTemplatesChanges,
    currentCustomTemplates,
    listenToTemplateManifestChanges: ignoringStore(listenToTemplateManifestChanges),
    currentTemplateManifest,
  },
  settings: {
    listenToExportConfigSettingsChanges: ignoringStore(listenToExportConfigSettingsChanges),
    currentExportConfigSettings,
    listenToAppSettingsChanges: ignoringStore(listenToAppSettingsChanges),
    currentAppSettings,
    listenToUserSettingsChanges: ignoringStore(listenToUserSettingsChanges),
    currentUserSettings,
  },
}

const world = plottrWorldAPI(theWorld)

export default world

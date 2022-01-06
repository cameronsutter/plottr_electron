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

const afterSettingsLoad = (store, fn) => {
  const appSettingsLoaded = selectors.applicationSettingsAreLoadedSelector(store.getState().present)
  if (!appSettingsLoaded) {
    const unsubscribe = observeStore(
      store,
      selectors.applicationSettingsAreLoadedSelector,
      (loaded) => {
        if (loaded) {
          unsubscribe()
          afterSettingsLoad(store, fn)
        }
      }
    )
    return
  }
  fn()
}

const combineCloudAndFileSystemSources =
  (fileSystemSource, cloudSource, mergeSources) => (store, cb) => {
    let _currentFileSystemResult = null
    let _currentCloudResult = null

    const unsubscribeFromFileSystemSource = fileSystemSource((fileSystemResult) => {
      _currentFileSystemResult = fileSystemResult
      afterSettingsLoad(store, () => {
        const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(
          store.getState().present
        )
        if (_currentCloudResult) {
          cb(mergeSources(_currentFileSystemResult, _currentCloudResult))
        } else if (!previouslyLoggedIntoPro) {
          cb(_currentFileSystemResult)
        }
      })
    })

    const unsubscribeFromCloudSource = cloudSource((cloudResult) => {
      _currentCloudResult = cloudResult
      afterSettingsLoad(store, () => {
        const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(
          store.getState().present
        )
        if (_currentFileSystemResult) {
          cb(mergeSources(_currentFileSystemResult, _currentCloudResult))
        } else if (previouslyLoggedIntoPro) {
          cb(_currentCloudResult)
        }
      })
    })

    return () => {
      unsubscribeFromFileSystemSource()
      unsubscribeFromCloudSource()
    }
  }

const mergeWithConcat = (source1, source2) => source1.concat(source2)

const listenToknownFilesChanges = combineCloudAndFileSystemSources(
  fileSystemAPIs.listenToknownFilesChanges,
  firebaseAPIs.listenToKnownFiles,
  mergeWithConcat
)

const currentKnownFiles = (cb) => {
  return fileSystemAPIs.currentKnownFiles().concat(firebaseAPIs.currentKnownFiles())
}

const listenToCustomTemplatesChanges = combineCloudAndFileSystemSources(
  fileSystemAPIs.listenToCustomTemplatesChanges,
  firebaseAPIs.listenToCustomTemplates,
  mergeWithConcat
)
const currentCustomTemplates = () => {
  return fileSystemAPIs.currentCustomTemplates().concat(firebaseAPIs.currentCustomTemplates())
}

const mergeBackups = (firebaseFolders, localFolders) => {
  const allFolders = firebaseFolders.concat(localFolders)
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
const listenToBackupsChanges = combineCloudAndFileSystemSources(
  fileSystemAPIs.listenToBackupsChanges,
  firebaseAPIs.listenToBackupsChanges,
  mergeBackups
)

const currentBackups = () => {
  return mergeBackups(fileSystemAPIs.currentBackups(), firebaseAPIs.currentBackups())
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

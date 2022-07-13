import { groupBy, flatten } from 'lodash'

import { selectors } from 'pltr/v2'
import { plottrWorldAPI } from 'plottr_world'

import { makeFileSystemAPIs, firebaseAPIs } from './api'
import logger from '../shared/logger'

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
  (fileSystemSource, cloudSource, mergeSources, forceIncludeLocal = false) =>
  (store, cb) => {
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
        } else if (forceIncludeLocal || !previouslyLoggedIntoPro) {
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
const ignoringStore = (fn) => (store, cb) => fn(cb)

const theWorld = (socketClient) => {
  const fileSystemAPIs = makeFileSystemAPIs(socketClient)

  const listenToknownFilesChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToknownFilesChanges,
    firebaseAPIs.listenToKnownFiles,
    mergeWithConcat
  )

  const currentKnownFiles = () => {
    return fileSystemAPIs.currentKnownFiles().then((fileSystemKnownFiles) => {
      return fileSystemKnownFiles.concat(firebaseAPIs.currentKnownFiles())
    })
  }

  const listenToCustomTemplatesChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToCustomTemplatesChanges,
    firebaseAPIs.listenToCustomTemplates,
    mergeWithConcat
  )
  const currentCustomTemplates = () => {
    return fileSystemAPIs.currentCustomTemplates().then((fileSystemCustomTemplates) => {
      return fileSystemCustomTemplates.concat(firebaseAPIs.currentCustomTemplates())
    })
  }

  const listenToBackupsChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToBackupsChanges,
    firebaseAPIs.listenToBackupsChanges,
    mergeBackups,
    true
  )

  const currentBackups = () => {
    return fileSystemAPIs.currentBackups().then((fileSystemBackups) => {
      return mergeBackups(fileSystemBackups, firebaseAPIs.currentBackups())
    })
  }

  return {
    logger,
    license: {
      listenToTrialChanges: ignoringStore(fileSystemAPIs.listenToTrialChanges),
      currentTrial: fileSystemAPIs.currentTrial,
      listenToLicenseChanges: ignoringStore(fileSystemAPIs.listenToLicenseChanges),
      currentLicense: fileSystemAPIs.currentLicense,
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
      listenToTemplatesChanges: ignoringStore(fileSystemAPIs.listenToTemplatesChanges),
      currentTemplates: fileSystemAPIs.currentTemplates,
      listenToCustomTemplatesChanges,
      currentCustomTemplates,
      listenToTemplateManifestChanges: ignoringStore(
        fileSystemAPIs.listenToTemplateManifestChanges
      ),
      currentTemplateManifest: fileSystemAPIs.currentTemplateManifest,
    },
    settings: {
      listenToExportConfigSettingsChanges: ignoringStore(
        fileSystemAPIs.listenToExportConfigSettingsChanges
      ),
      currentExportConfigSettings: fileSystemAPIs.currentExportConfigSettings,
      listenToAppSettingsChanges: ignoringStore(fileSystemAPIs.listenToAppSettingsChanges),
      currentAppSettings: fileSystemAPIs.currentAppSettings,
      listenToUserSettingsChanges: ignoringStore(fileSystemAPIs.listenToUserSettingsChanges),
      currentUserSettings: fileSystemAPIs.currentUserSettings,
    },
  }
}

const makeWorldAPI = (socketClient) => plottrWorldAPI(theWorld(socketClient))

export default makeWorldAPI

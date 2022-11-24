import { v4 as uuid } from 'uuid'

const ask = (channel, ...args) => {
  const listenToken = `${channel}-${uuid()}`
  // Maybe add a timeout?
  return new Promise((resolve, reject) => {
    try {
      const listener = (event, ...args) => {
        window.api.stopListening(listenToken, listener)
        resolve(...args)
      }
      window.api.listen(listenToken, listener)
      window.api.send(channel, listenToken, ...args)
    } catch (error) {
      reject(error)
    }
  })
}

const tell = (channel, ...args) => {
  window.api.send(channel, ...args)
  return Promise.resolve()
}

const subscribeTo = (channel, cb) => {
  window.api.listen(channel, (event, ...args) => {
    cb(...args)
  })
  return () => {
    window.api.stopListening(channel, cb)
  }
}

const _makeMainProcessClient = () => {
  const setWindowTitle = (newTitle) => {
    throw new Error('Implement!')
  }
  const setRepresentedFileName = (newFileName) => {
    throw new Error('Implement!')
  }
  const getVersion = () => {
    return ask('please-tell-me-my-version')
  }
  const showErrorBox = (title, message) => {
    throw new Error('Implement!')
  }

  const windowId = () => {
    throw new Error('Implement!')
  }

  const showMessageBox = (title, message, type, detail) => {
    throw new Error('Implement!')
  }

  const showSaveDialog = (filters, title, defaultPath) => {
    throw new Error('Implement!')
  }

  const setFileURL = (newFileURL) => {
    throw new Error('Implement!')
  }

  const userDataPath = () => {
    throw new Error('Implement!')
  }

  const userDocumentsPath = () => {
    throw new Error('Implement!')
  }

  const logsPath = () => {
    throw new Error('Implement!')
  }

  const showOpenDialog = (title, filters, properties) => {
    throw new Error('Implement!')
  }

  const hostLocale = () => {
    throw new Error('Implement!')
  }

  const openExternal = (url) => {
    throw new Error('Implement!')
  }

  const showItemInFolder = (filePath) => {
    throw new Error('Implement!')
  }

  const getEnvObject = () => {
    throw new Error('Implement!')
  }

  const logInfo = (...args) => {
    return tell('log-info', ...args)
  }

  const logWarn = (...args) => {
    return tell('log-warn', ...args)
  }

  const logError = (...args) => {
    return tell('log-error', ...args)
  }

  const machineId = () => {
    return ask('machine-id')
  }

  const setMyFilePath = (filePath) => {
    throw new Error('Implement!')
  }

  const onRenameFile = (cb) => {
    // This should be the unsubscribe function...
    throw new Error('IMPLEMENT LISTENER!')
  }

  const openKnownFile = (fileURL, unknown) => {
    throw new Error('Implement!')
  }

  const devOpenAnalyzerFile = (fileName, filePath) => {
    throw new Error('Implement!')
  }

  // NOTE: there used to be an 'unknown' param for this message.  I
  // don't think it actually gets used.
  const pleaseOpenWindow = (fileURL) => {
    throw new Error('Implement!')
  }

  const onAdvancedExportFileFromMenu = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onTurnOnActsHelp = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onReload = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const reloadFromFile = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onStateFetched = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const pleaseFetchState = (id, isInProMode) => {
    throw new Error('Implement!')
  }

  const updateLastOpenedFile = (fileURL) => {
    throw new Error('Implement!')
  }

  const openBuyWindow = () => {
    throw new Error('Implement!')
  }

  const tellMeWhatOSImOn = () => {
    return ask('tell-me-what-os-i-am-on')
  }

  const pleaseTellMeTheSocketServerPort = () => {
    return ask('pls-tell-me-the-socket-worker-port')
  }

  const getLocale = () => {
    throw new Error('Implement!')
  }

  const onSetBeatHierarchy = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUnsetBeatHierachy = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onExportFileFromMenu = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onSave = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onSaveAs = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const removeFromTempFilesIfTemp = (fileURL) => {
    throw new Error('Implement!')
  }

  const editKnownFilePath = (oldFileURL, newFileURL) => {
    throw new Error('Implement!')
  }

  const pleaseTellDashboardToReloadRecents = () => {
    throw new Error('Implement!')
  }

  const onUndo = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onRedu = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const listenOnceToSendLaunch = (cb) => {}

  const onCreateErrorReport = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onCloseDashboard = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onCreatePlottrCloudFile = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const errorImportingScrivener = (error) => {
    throw new Error('Implement!')
  }

  const onFinishCreatingLocalScrivenerImportedFile = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onErrorImportingScrivener = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onConvertRTFStringToSlate = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const replyToConvertRTFStringToSlateRequest = (conversionId, converted) => {
    throw new Error('Implement!')
  }

  const pleaseReloadMenu = () => {
    throw new Error('Implement!')
  }

  const onNewProject = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onOpenExisting = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onFromTemplate = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onError = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUpdateWorkerPort = (cb) => {
    // This should be the unsubscribe function
    return subscribeTo('update-worker-port', cb)
  }

  const onReloadDarkMode = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onImportScrivenerFile = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const createFromScrivener = () => {
    throw new Error('Implement!')
  }

  const listenersRegistered = () => {
    throw new Error('Implement!')
  }

  const notify = (title, message) => {
    throw new Error('Implement!')
  }

  const openPath = (path) => {
    throw new Error('Implement!')
  }

  const removeFromKnownFiles = (fileURL) => {
    throw new Error('Implement!')
  }

  const addToKnownFilesAndOpen = (fileURL) => {
    throw new Error('Implement!')
  }

  const pleaseSetDarkModeSetting = (value) => {
    throw new Error('Implement!')
  }

  const pleaseQuit = () => {
    throw new Error('Implement!')
  }

  const createNewFile = (template, name) => {
    throw new Error('Implement!')
  }

  const deleteKnownFile = (fileURL) => {
    throw new Error('Implement!')
  }

  const createFromSnowflake = (importedPath, isLoggedIntoPro) => {
    throw new Error('Implement!')
  }

  const pleaseQuitAndInstall = () => {
    throw new Error('Implement!')
  }

  const pleaseDownloadUpdate = () => {
    throw new Error('Implement!')
  }

  const pleaseCheckForUpdates = () => {
    throw new Error('Implement!')
  }

  const onUpdateError = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUpdaterUpdateAvailable = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUpdaterUpdateNotAvailable = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUpdaterDownloadProgress = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const onUpdaterUpdateDownloaded = (cb) => {
    // This should be the unsubscribe function
    throw new Error('IMPLEMENT LISTENER!')
  }

  const pleaseUpdateLanguage = (newLanguage) => {
    throw new Error('Implement!')
  }

  const updateBeatHierarchy = (newValue) => {
    throw new Error('Implement!')
  }

  const downloadFileAndShow = (fileURL) => {
    throw new Error('Implement!')
  }

  const pleaseOpenLoginPopup = () => {
    throw new Error('Implement!')
  }

  const pleaseTellMeWhatPlatformIAmOn = () => {
    return ask('please-tell-me-what-platform-i-am-on')
  }

  return {
    setWindowTitle,
    setRepresentedFileName,
    getVersion,
    showErrorBox,
    windowId,
    showMessageBox,
    showSaveDialog,
    setFileURL,
    userDataPath,
    userDocumentsPath,
    logsPath,
    showOpenDialog,
    hostLocale,
    openExternal,
    showItemInFolder,
    getEnvObject,
    logInfo,
    logWarn,
    logError,
    machineId,
    setMyFilePath,
    onRenameFile,
    openKnownFile,
    devOpenAnalyzerFile,
    pleaseOpenWindow,
    onAdvancedExportFileFromMenu,
    onTurnOnActsHelp,
    onReload,
    reloadFromFile,
    onStateFetched,
    pleaseFetchState,
    updateLastOpenedFile,
    openBuyWindow,
    tellMeWhatOSImOn,
    pleaseTellMeTheSocketServerPort,
    getLocale,
    onSetBeatHierarchy,
    onUnsetBeatHierachy,
    onExportFileFromMenu,
    onSave,
    onSaveAs,
    removeFromTempFilesIfTemp,
    editKnownFilePath,
    pleaseTellDashboardToReloadRecents,
    onUndo,
    onRedu,
    listenOnceToSendLaunch,
    onCreateErrorReport,
    onCloseDashboard,
    onCreatePlottrCloudFile,
    errorImportingScrivener,
    onFinishCreatingLocalScrivenerImportedFile,
    onErrorImportingScrivener,
    onConvertRTFStringToSlate,
    replyToConvertRTFStringToSlateRequest,
    pleaseReloadMenu,
    onNewProject,
    onOpenExisting,
    onFromTemplate,
    onError,
    onUpdateWorkerPort,
    onReloadDarkMode,
    onImportScrivenerFile,
    createFromScrivener,
    listenersRegistered,
    notify,
    openPath,
    removeFromKnownFiles,
    addToKnownFilesAndOpen,
    pleaseSetDarkModeSetting,
    pleaseQuit,
    createNewFile,
    deleteKnownFile,
    createFromSnowflake,
    pleaseQuitAndInstall,
    pleaseDownloadUpdate,
    pleaseCheckForUpdates,
    onUpdateError,
    onUpdaterUpdateAvailable,
    onUpdaterUpdateNotAvailable,
    onUpdaterDownloadProgress,
    onUpdaterUpdateDownloaded,
    pleaseUpdateLanguage,
    updateBeatHierarchy,
    downloadFileAndShow,
    pleaseOpenLoginPopup,
    pleaseTellMeWhatPlatformIAmOn,
  }
}

let singletonMainProcessClient = null
export const makeMainProcessClient = () => {
  if (!singletonMainProcessClient) {
    singletonMainProcessClient = _makeMainProcessClient()
  }
  return singletonMainProcessClient
}

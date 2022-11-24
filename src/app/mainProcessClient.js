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

export const makeMainProcessClient = () => {
  const setWindowTitle = (newTitle) => {
    return Promise.resolve()
  }
  const setRepresentedFileName = (newFileName) => {
    return Promise.resolve()
  }
  const getVersion = () => {
    return Promise.resolve()
  }
  const showErrorBox = (title, message) => {
    return Promise.resolve()
  }

  const windowId = () => {
    return Promise.resolve()
  }

  const showMessageBox = (title, message, type, detail) => {
    return Promise.resolve()
  }

  const showSaveDialog = (filters, title, defaultPath) => {
    return Promise.resolve()
  }

  const setFileURL = (newFileURL) => {
    return Promise.resolve()
  }

  const userDataPath = () => {
    return Promise.resolve()
  }

  const userDocumentsPath = () => {
    return Promise.resolve()
  }

  const logsPath = () => {
    return Promise.resolve()
  }

  const showOpenDialog = (title, filters, properties) => {
    return Promise.resolve()
  }

  const hostLocale = () => {
    return Promise.resolve()
  }

  const openExternal = (url) => {
    return Promise.resolve()
  }

  const showItemInFolder = (filePath) => {
    return Promise.resolve()
  }

  const getEnvObject = () => {
    return Promise.resolve()
  }

  const logInfo = () => {
    return Promise.resolve()
  }

  const logWarn = () => {
    return Promise.resolve()
  }

  const logError = () => {
    return Promise.resolve()
  }

  const machineId = () => {
    return Promise.resolve()
  }

  const setMyFilePath = (filePath) => {
    return Promise.resolve()
  }

  const onRenameFile = (cb) => {
    // This should be the unsubscribe function...
    return () => {}
  }

  const openKnownFile = (fileURL, unknown) => {
    return Promise.resolve()
  }

  const devOpenAnalyzerFile = (fileName, filePath) => {
    return Promise.resolve()
  }

  // NOTE: there used to be an 'unknown' param for this message.  I
  // don't think it actually gets used.
  const pleaseOpenWindow = (fileURL) => {
    return Promise.resolve()
  }

  const onAdvancedExportFileFromMenu = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onTurnOnActsHelp = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onReload = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const reloadFromFile = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onStateFetched = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const pleaseFetchState = (id, isInProMode) => {
    return Promise.resolve()
  }

  const updateLastOpenedFile = (fileURL) => {
    return Promise.resolve()
  }

  const openBuyWindow = () => {
    return Promise.resolve()
  }

  const tellMeWhatOSImOn = () => {
    return ask('tell-me-what-os-i-am-on')
  }

  const pleaseTellMeTheSocketServerPort = () => {
    return ask('pls-tell-me-the-socket-worker-port')
  }

  const getLocale = () => {
    return Promise.resolve()
  }

  const onSetBeatHierarchy = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUnsetBeatHierachy = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onExportFileFromMenu = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onSave = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onSaveAs = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const removeFromTempFilesIfTemp = (fileURL) => {
    return Promise.resolve()
  }

  const editKnownFilePath = (oldFileURL, newFileURL) => {
    return Promise.resolve()
  }

  const pleaseTellDashboardToReloadRecents = () => {
    return Promise.resolve()
  }

  const onUndo = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onRedu = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const listenOnceToSendLaunch = (cb) => {}

  const onCreateErrorReport = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onCloseDashboard = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onCreatePlottrCloudFile = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const errorImportingScrivener = (error) => {
    return Promise.resolve()
  }

  const onFinishCreatingLocalScrivenerImportedFile = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onErrorImportingScrivener = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onConvertRTFStringToSlate = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const replyToConvertRTFStringToSlateRequest = (conversionId, converted) => {
    return Promise.resolve()
  }

  const pleaseReloadMenu = () => {
    return Promise.resolve()
  }

  const onNewProject = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onOpenExisting = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onFromTemplate = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onError = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUpdateWorkerPort = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onReloadDarkMode = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onImportScrivenerFile = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const createFromScrivener = () => {
    return Promise.resolve()
  }

  const listenersRegistered = () => {
    return Promise.resolve()
  }

  const notify = (title, message) => {
    return Promise.resolve()
  }

  const openPath = (path) => {
    return Promise.resolve()
  }

  const removeFromKnownFiles = (fileURL) => {
    return Promise.resolve()
  }

  const addToKnownFilesAndOpen = (fileURL) => {
    return Promise.resolve()
  }

  const pleaseSetDarkModeSetting = (value) => {
    return Promise.resolve()
  }

  const pleaseQuit = () => {
    return Promise.resolve()
  }

  const createNewFile = (template, name) => {
    return Promise.resolve()
  }

  const deleteKnownFile = (fileURL) => {
    return Promise.resolve()
  }

  const createFromSnowflake = (importedPath, isLoggedIntoPro) => {
    return Promise.resolve()
  }

  const pleaseQuitAndInstall = () => {
    return Promise.resolve()
  }

  const pleaseDownloadUpdate = () => {
    return Promise.resolve()
  }

  const pleaseCheckForUpdates = () => {
    return Promise.resolve()
  }

  const onUpdateError = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUpdaterUpdateAvailable = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUpdaterUpdateNotAvailable = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUpdaterDownloadProgress = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const onUpdaterUpdateDownloaded = (cb) => {
    // This should be the unsubscribe function
    return () => {}
  }

  const pleaseUpdateLanguage = (newLanguage) => {
    return Promise.resolve()
  }

  const updateBeatHierarchy = (newValue) => {
    return Promise.resolve()
  }

  const downloadFileAndShow = (fileURL) => {
    return Promise.resolve()
  }

  const pleaseOpenLoginPopup = () => {
    return Promise.resolve()
  }

  const pleaseTellMeWhatPlatformIAmOn = () => {
    return Promise.resolve()
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

import { v4 as uuid } from 'uuid'

const ask = (channel, ...args) => {
  const listenToken = `${channel}-${uuid()}`
  // Maybe add a timeout?
  return new Promise((resolve, reject) => {
    try {
      const listener = (event, ...args) => {
        window.api.stopListening(listenToken, listener)
        if (args.length === 1) {
          resolve(args[0])
        } else {
          resolve(args)
        }
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
    return ask('set-window-title', newTitle)
  }
  const setRepresentedFileName = (newFileName) => {
    return ask('set-represented-file-name', newFileName)
  }
  const getVersion = () => {
    return ask('please-tell-me-my-version')
  }
  const showErrorBox = (title, message) => {
    return ask('show-error-box', title, message)
  }

  const windowId = () => {
    return ask('window-id')
  }

  const showMessageBox = (title, message, type, detail) => {
    return ask('show-message-box', title, message, type, detail)
  }

  const showSaveDialog = (filters, title, defaultPath) => {
    return ask('show-save-dialog', filters, title, defaultPath)
  }

  const setFileURL = (newFileURL) => {
    return ask('set-file-url', newFileURL)
  }

  const userDataPath = () => {
    return ask('user-data-path')
  }

  const userDocumentsPath = () => {
    return ask('user-documents-path')
  }

  const logsPath = () => {
    return ask('user-logs-path')
  }

  const showOpenDialog = (title, filters, properties) => {
    return ask('show-open-dialog', title, filters, properties)
  }

  const openExternal = (url) => {
    return ask('open-external', url)
  }

  const showItemInFolder = (filePath) => {
    return ask('show-item-in-folder', filePath)
  }

  const getEnvObject = () => {
    return ask('get-env-object')
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
    return ask('pls-set-my-file-path', filePath)
  }

  const openKnownFile = (fileURL, unknown) => {
    return ask('open-known-file', fileURL, unknown)
  }

  const devOpenAnalyzerFile = (fileName, filePath) => {
    throw new Error('Implement!  devOpenAnalyzerFile')
  }

  // NOTE: there used to be an 'unknown' param for this message.  I
  // don't think it actually gets used.
  const pleaseOpenWindow = (fileURL) => {
    return ask('pls-open-window', fileURL)
  }

  const onAdvancedExportFileFromMenu = (cb) => {
    return subscribeTo('advanced-export-file-from-menu', cb)
  }

  const onTurnOnActsHelp = (cb) => {
    return subscribeTo('turn-on-acts-help', cb)
  }

  const onReload = (cb) => {
    return subscribeTo('reload', cb)
  }

  const onReloadFromFile = (cb) => {
    return subscribeTo('reload-from-file', cb)
  }

  const pleaseFetchState = (isInProMode) => {
    return ask('pls-fetch-state', isInProMode)
  }

  const updateLastOpenedFile = (fileURL) => {
    throw new Error('Implement!  updateLastOpenedFile')
  }

  const openBuyWindow = () => {
    throw new Error('Implement!  openBuyWindow')
  }

  const tellMeWhatOSImOn = () => {
    return ask('tell-me-what-os-i-am-on')
  }

  const pleaseTellMeTheSocketServerPort = () => {
    return ask('pls-tell-me-the-socket-worker-port')
  }

  const getLocale = () => {
    return ask('get-locale')
  }
  const hostLocale = getLocale

  const onSetBeatHierarchy = (cb) => {
    return subscribeTo('set-beat-hierarchy', cb)
  }

  const onUnsetBeatHierachy = (cb) => {
    return subscribeTo('unset-beat-hierarchy', cb)
  }

  const onExportFileFromMenu = (cb) => {
    return subscribeTo('export-file-from-menu', cb)
  }

  const onSave = (cb) => {
    return subscribeTo('save', cb)
  }

  const onSaveAs = (cb) => {
    return subscribeTo('save-as', cb)
  }

  const removeFromTempFilesIfTemp = (fileURL) => {
    throw new Error('Implement!  removeFromTempFilesIfTemp')
  }

  const editKnownFilePath = (oldFileURL, newFileURL) => {
    throw new Error('Implement!  editKnownFilePath')
  }

  const pleaseTellDashboardToReloadRecents = () => {
    throw new Error('Implement!  pleaseTellDashboardToReloadRecents')
  }

  const onUndo = (cb) => {
    return subscribeTo('undo', cb)
  }

  const onRedu = (cb) => {
    return subscribeTo('redo', cb)
  }

  const onCreateErrorReport = (cb) => {
    return subscribeTo('create-error-report', cb)
  }

  const onCloseDashboard = (cb) => {
    return subscribeTo('close-dashboard', cb)
  }

  const onCreatePlottrCloudFile = (cb) => {
    return subscribeTo('create-plottr-cloud-file', cb)
  }

  const errorImportingScrivener = (error) => {
    throw new Error('Implement!  errorImportingScrivener')
  }

  const onFinishCreatingLocalScrivenerImportedFile = (cb) => {
    return subscribeTo('finish-creating-local-scrivener-imported-file', cb)
  }

  const onErrorImportingScrivener = (cb) => {
    return subscribeTo('error-importing-scrivener', cb)
  }

  const onConvertRTFStringToSlate = (cb) => {
    return subscribeTo('convert-rtf-string-to-slate', cb)
  }

  const replyToConvertRTFStringToSlateRequest = (conversionId, converted) => {
    throw new Error('Implement!  replyToConvertRTFStringToSlateRequest')
  }

  const pleaseReloadMenu = () => {
    return ask('please-reload-menu')
  }

  const onNewProject = (cb) => {
    return subscribeTo('new-project', cb)
  }

  const onOpenExisting = (cb) => {
    return subscribeTo('open-existing', cb)
  }

  const onFromTemplate = (cb) => {
    return subscribeTo('from-template', cb)
  }

  const onError = (cb) => {
    return subscribeTo('error', cb)
  }

  const onUpdateWorkerPort = (cb) => {
    return subscribeTo('update-worker-port', cb)
  }

  const onReloadDarkMode = (cb) => {
    return subscribeTo('reload-dark-mode', cb)
  }

  const onImportScrivenerFile = (cb) => {
    return subscribeTo('import-scrivener-file', cb)
  }

  const createFromScrivener = () => {
    throw new Error('Implement!  createFromScrivener')
  }

  const listenersRegistered = () => {
    return ask('listeners-registered')
  }

  const notify = (title, message) => {
    throw new Error('Implement!  notify')
  }

  const openPath = (path) => {
    throw new Error('Implement!  openPath')
  }

  const removeFromKnownFiles = (fileURL) => {
    throw new Error('Implement!  removeFromKnownFiles')
  }

  const addToKnownFilesAndOpen = (fileURL) => {
    throw new Error('Implement!  addToKnownFilesAndOpen')
  }

  const pleaseSetDarkModeSetting = (value) => {
    throw new Error('Implement!  pleaseSetDarkModeSetting')
  }

  const pleaseQuit = () => {
    throw new Error('Implement!  pleaseQuit')
  }

  const createNewFile = (template, name) => {
    throw new Error('Implement!  createNewFile')
  }

  const deleteKnownFile = (fileURL) => {
    throw new Error('Implement!  deleteKnownFile')
  }

  const createFromSnowflake = (importedPath, isLoggedIntoPro) => {
    throw new Error('Implement!  createFromSnowflake')
  }

  const pleaseQuitAndInstall = () => {
    throw new Error('Implement!  pleaseQuitAndInstall')
  }

  const pleaseDownloadUpdate = () => {
    throw new Error('Implement!  pleaseDownloadUpdate')
  }

  const pleaseCheckForUpdates = () => {
    throw new Error('Implement!  pleaseCheckForUpdates')
  }

  const onUpdateError = (cb) => {
    return subscribeTo('updater-error', cb)
  }

  const onUpdaterUpdateAvailable = (cb) => {
    return subscribeTo('update-available', cb)
  }

  const onUpdaterUpdateNotAvailable = (cb) => {
    return subscribeTo('update-not-available', cb)
  }

  const onUpdaterDownloadProgress = (cb) => {
    return subscribeTo('download-progress', cb)
  }

  const onUpdaterUpdateDownloaded = (cb) => {
    return subscribeTo('update-downloaded', cb)
  }

  const pleaseUpdateLanguage = (newLanguage) => {
    throw new Error('Implement!  pleaseUpdateLanguage')
  }

  const updateBeatHierarchy = (newValue) => {
    throw new Error('Implement!  updateBeatHierarchy')
  }

  const downloadFileAndShow = (fileURL) => {
    throw new Error('Implement!  downloadFileAndShow')
  }

  const pleaseOpenLoginPopup = () => {
    return ask('pls-open-login-popup')
  }

  const pleaseTellMeWhatPlatformIAmOn = () => {
    return ask('please-tell-me-what-platform-i-am-on')
  }

  const onSaveAsOnPro = (cb) => {
    return subscribeTo('save-as--pro', cb)
  }

  const onWantsToClose = (cb) => {
    return subscribeTo('wants-to-close', cb)
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
    openKnownFile,
    devOpenAnalyzerFile,
    pleaseOpenWindow,
    onAdvancedExportFileFromMenu,
    onTurnOnActsHelp,
    onReload,
    onReloadFromFile,
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
    onSaveAsOnPro,
    onWantsToClose,
  }
}

let singletonMainProcessClient = null
export const makeMainProcessClient = () => {
  if (!singletonMainProcessClient) {
    singletonMainProcessClient = _makeMainProcessClient()
  }
  return singletonMainProcessClient
}

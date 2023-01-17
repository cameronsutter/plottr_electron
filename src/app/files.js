const makeFileModule = (whenClientIsReady) => {
  const saveOfflineFile = (jsonData) => {
    return whenClientIsReady(({ saveOfflineFile }) => {
      return saveOfflineFile(jsonData)
    })
  }

  const saveFile = (fileURL, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(fileURL, jsonData)
    })
  }

  const backupOfflineBackupForResume = (file) => {
    return whenClientIsReady(({ backupOfflineBackupForResume }) => {
      return backupOfflineBackupForResume(file)
    })
  }

  const readOfflineFiles = () => {
    return whenClientIsReady(({ readOfflineFiles }) => {
      return readOfflineFiles()
    })
  }

  const isTempFile = (file) => {
    return whenClientIsReady(({ isTempFile }) => {
      return isTempFile(file)
    })
  }

  const saveAsTempFile = (file) => {
    return whenClientIsReady(({ saveAsTempFile }) => {
      return saveAsTempFile(file)
    })
  }

  const copyFile = (sourceFileURL, newFileURL) => {
    return whenClientIsReady(({ copyFile }) => {
      return copyFile(sourceFileURL, newFileURL)
    })
  }

  const createFileShortcut = (sourceFileURL, newFileURL) => {
    return whenClientIsReady(({ createFileShortcut }) => {
      return createFileShortcut(sourceFileURL, newFileURL)
    })
  }

  const basename = (fileURL) => {
    return whenClientIsReady(({ basename }) => {
      return basename(fileURL)
    })
  }

  return {
    saveOfflineFile,
    saveFile,
    backupOfflineBackupForResume,
    readOfflineFiles,
    isTempFile,
    saveAsTempFile,
    copyFile,
    basename,
    createFileShortcut,
  }
}

export { makeFileModule }

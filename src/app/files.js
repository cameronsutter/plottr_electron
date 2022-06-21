const makeFileModule = (whenClientIsReady) => {
  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
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

  return { saveFile, backupOfflineBackupForResume, readOfflineFiles }
}

export { makeFileModule }

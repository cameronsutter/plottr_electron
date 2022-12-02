import React from 'react'

const MainIntegrationContext = React.createContext({
  saveOfflineFile: (fileURL, data) => {
    throw new Error(
      `Couldn't save offline file of ${fileURL} with data: ${data}.  Please wire up the MainIntegrationContext provider.`
    )
  },
  saveFile: (fileURL, data) => {
    throw new Error(
      `Couldn't save file at ${fileURL} with data: ${data}.  Please wire up the MainIntegrationContext provider.`
    )
  },
  basename: (filePath) => {
    throw new Error(
      `Couldn't produce the basename of ${filePath}.  Please wire up the MainIntegrationContext provider.`
    )
  },
  readFile: (filePath) => {
    throw new Error(
      `Couldn't read file at ${filePath}.  Please wire up the MainIntegrationContext provider.`
    )
  },
  saveBackup: (filePath, file) => {
    throw new Error(
      `Couldn't back-up file at ${filePath}.  Please wire up the MainIntegrationContext provider.`
    )
  },
  backupOfflineBackupForResume: (file) => {
    throw new Error(
      `Couldn't back-up an offline file to resume from the file.  Please wire up the MainIntegrationCentext provider.`
    )
  },
  saveAppSetting: (key, value) => {
    throw new Error(
      `Couldn't save an app setting for ${key} to ${value}.  Please wire up the MainIntegrationContext provider`
    )
  },
  showErrorBox: (title, message) => {
    throw new Error(`Couldn't display an error box for title ${title} and message ${message}`)
  },
})

export default MainIntegrationContext

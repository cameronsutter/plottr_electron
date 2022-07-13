import React from 'react'

const MainIntegrationContext = React.createContext({
  saveFile: (filePath, data) => {
    throw new Error(
      `Couldn't save file at ${filePath} with data: ${data}.  Please wire up the MainIntegrationContext provider.`
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
  autoSave: (filePath, file, userId, previousFile) => {
    throw new Error(
      `Couldn't auto save file at ${filePath}.  Please wire up the MainIntegrationContext provider.`
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
})

export default MainIntegrationContext

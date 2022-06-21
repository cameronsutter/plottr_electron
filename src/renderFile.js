import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import Main from 'containers/Main'
import Listener from './app/components/listener'
import Renamer from './app/components/Renamer'
import SaveAs from './app/components/SaveAs'
import Error from './app/components/Error'
import Resume from './app/components/Resume'
import MainIntegrationContext from './mainIntegrationContext'

import { store } from './app/store'

export const renderFile = (root, whenClientIsReady) => {
  const saveFile = (filePath, file) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, file)
    })
  }

  const basename = (filePath) => {
    return whenClientIsReady(({ basename }) => {
      return basename(filePath)
    })
  }

  const readFile = (filePath) => {
    return whenClientIsReady(({ readFile }) => {
      return readFile(filePath)
    })
  }

  const autoSave = (filePath, file, userId, previousFile) => {
    return whenClientIsReady(({ autoSave }) => {
      return autoSave(filePath, file, userId, previousFile)
    })
  }

  const saveBackup = (filePath, file) => {
    return whenClientIsReady(({ saveBackup }) => {
      return saveBackup(filePath, file)
    })
  }

  const backupOfflineBackupForResume = (file) => {
    return whenClientIsReady(({ backupOfflineBackupForResume }) => {
      return backupOfflineBackupForResume(file)
    })
  }

  render(
    <Provider store={store}>
      <MainIntegrationContext.Provider
        value={{ saveFile, basename, readFile, autoSave, saveBackup, backupOfflineBackupForResume }}
      >
        <Listener />
        <Renamer />
        <SaveAs />
        <Error />
        <Resume />
        <Main saveBackup={saveBackup} />
      </MainIntegrationContext.Provider>
    </Provider>,
    root
  )
}

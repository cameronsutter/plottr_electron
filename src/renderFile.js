import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { selectors } from 'pltr/v2'

import { saveBackup as saveBackupOnFirebase } from 'wired-up-firebase'

import Main from 'containers/Main'
import Listener from './app/components/listener'
import Renamer from './app/components/Renamer'
import SaveAs from './app/components/SaveAs'
import Error from './app/components/Error'
import Resume from './app/components/Resume'
import Busy from './app/components/Busy'
import MainIntegrationContext from './mainIntegrationContext'

import { store } from './app/store'
import makeFileSystemAPIs from './api/file-system-apis'
import { makeMainProcessClient } from './app/mainProcessClient'

export const renderFile = (root, whenClientIsReady) => {
  const saveOfflineFile = (file) => {
    return whenClientIsReady(({ saveOfflineFile }) => {
      return saveOfflineFile(file)
    })
  }

  const saveFile = (fileURL, file) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(fileURL, file)
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

  const saveBackup = (filePath, file) => {
    const state = store.getState().present
    const onCloud = selectors.isCloudFileSelector(state)
    const userId = selectors.userIdSelector(state)
    const localBackupsEnabled = selectors.localBackupsEnabledSelector(state)

    const result = onCloud ? saveBackupOnFirebase(userId, file) : Promise.resolve(true)

    return result.then(() => {
      return whenClientIsReady(({ saveBackup }) => {
        if (!onCloud || (onCloud && localBackupsEnabled)) {
          return saveBackup(filePath, file)
        }
        return Promise.resolve(false)
      })
    })
  }

  const backupOfflineBackupForResume = (file) => {
    return whenClientIsReady(({ backupOfflineBackupForResume }) => {
      return backupOfflineBackupForResume(file)
    })
  }

  const { showErrorBox, getVersion, windowId, setWindowTitle } = makeMainProcessClient()

  const { saveAppSetting } = makeFileSystemAPIs(whenClientIsReady)

  render(
    <Provider store={store}>
      <MainIntegrationContext.Provider
        value={{
          saveOfflineFile,
          saveFile,
          basename,
          readFile,
          saveBackup,
          backupOfflineBackupForResume,
          saveAppSetting,
          showErrorBox,
        }}
      >
        <Listener showErrorBox={showErrorBox} />
        <Renamer />
        <SaveAs />
        <Error showErrorBox={showErrorBox} />
        <Resume
          backupOfflineBackupForResume={backupOfflineBackupForResume}
          getVersion={getVersion}
          showErrorBox={showErrorBox}
        />
        <Busy />
        <Main saveBackup={saveBackup} windowId={windowId} setWindowTitle={setWindowTitle} />
      </MainIntegrationContext.Provider>
    </Provider>,
    root
  )
}

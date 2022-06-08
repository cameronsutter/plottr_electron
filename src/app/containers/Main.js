import React, { useState, useEffect, useCallback } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import path from 'path'

import { actions, selectors } from 'pltr/v2'

import { bootFile } from '../bootFile'
import { isOfflineFile } from '../../common/utils/files'

import MainIntegrationContext from '../../mainIntegrationContext'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'
import ProOnboarding from './ProOnboarding'
import UploadOfflineFile from '../components/UploadOfflineFile'
import { uploadProject } from '../../common/utils/upload_project'

const win = getCurrentWindow()

const isCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

function displayFileName(filePath, isCloudFile, displayFilePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = displayFilePath ? ` - ${path.basename(filePath)}` : ''
  const plottr = isCloudFile ? 'Plottr Pro' : 'Plottr'
  return `${plottr}${baseFileName}${devMessage}`
}

const LoadingSplash = ({ loadingState, loadingProgress }) => {
  return (
    <div id="temporary-inner">
      <div className="loading-splash">
        <img src="../icons/logo_28_500.png" height="500" />
        {loadingState ? <h3>{loadingState}</h3> : null}
        {loadingProgress ? (
          <div className="loading-splash__progress">
            <div
              className="loading-splash__progress__bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
LoadingSplash.propTypes = {
  loadingState: PropTypes.string,
  loadingProgress: PropTypes.number,
}

const Main = ({
  isFirstTime,
  busyBooting,
  setOffline,
  needsToLogin,
  isInProMode,
  isInTrialModeWithExpiredTrial,
  showDashboard,
  checkingFileToLoad,
  checkedFileToLoad,
  readyToCheckFileToLoad,
  cantShowFile,
  loadingState,
  selectedFileIsCloudFile,
  startCheckingFileToLoad,
  finishCheckingFileToLoad,
  loadingProgress,
  fileToUpload,
  uploadingFileToCloud,
  emailAddress,
  userId,
  darkMode,
  isInOfflineMode,
  currentAppStateIsDashboard,
  fileName,
  isOnboarding,
  setCurrentAppStateToDashboard,
  setCurrentAppStateToApplication,
  promptToUploadFile,
  dismissPromptToUploadFile,
  startUploadingFileToCloud,
  finishUploadingFileToCloud,
  enableTestUtilities,
}) => {
  // The user needs a way to dismiss the files dashboard and continue
  // to the file that's open.
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)

  useEffect(() => {
    if (showDashboard && !dashboardClosed) {
      if (fileName && fileName.length > 0) {
        win.setTitle(displayFileName(fileName, isInProMode, false))
      }
      setCurrentAppStateToDashboard()
    } else {
      if (fileName && fileName.length > 0) {
        win.setTitle(displayFileName(fileName, isInProMode, true))
      }
    }
  }, [fileName, dashboardClosed, setCurrentAppStateToDashboard, showDashboard])

  useEffect(() => {
    if (!readyToCheckFileToLoad) return () => {}

    const load = (event, filePath, options, numOpenFiles, windowOpenedWithKnownPath) => {
      // We wont load a file at all on boot if this is supposed to be
      // the dashboard.
      if (!windowOpenedWithKnownPath && showDashboard && numOpenFiles <= 1) {
        finishCheckingFileToLoad()
        return
      }

      // To boot the file automatically: we must either be running pro
      // and it's a cloud file, or we must be running classic mode and
      // it's not a cloud file.
      if (
        !!isInProMode === !!isCloudFile(filePath) ||
        (isInOfflineMode && isOfflineFile(filePath))
      ) {
        bootFile(filePath, options, numOpenFiles)
      }
      // We only want to obey the setting to show the dashboard on
      // start-up for the first file opened.  All files opened after
      // that shouldn't have the dashboard opened.
      if (windowOpenedWithKnownPath || numOpenFiles > 1) {
        setDashboardClosed(true)
        setCurrentAppStateToApplication()
      }
      finishCheckingFileToLoad()
    }

    // This might look like unnecessary lambda wrapping, but I've done
    // it to make sure that we have destinct lambdas to de-register
    // later.
    const reloadListener = (event, filePath, options, numOpenFiles, windowOpenedWithKnownPath) => {
      const lastFileIsOfflineAndWeAreInPro =
        isInProMode && filePath && !filePath.startsWith('plottr://')
      if (lastFileIsOfflineAndWeAreInPro) {
        promptToUploadFile(filePath)
      } else {
        load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
      }
    }
    ipcRenderer.on('reload-from-file', reloadListener)

    if (checkedFileToLoad || checkingFileToLoad || needsToLogin) {
      return () => {
        ipcRenderer.removeListener('reload-from-file', reloadListener)
      }
    }

    const stateFetchedListener = (
      event,
      filePath,
      options,
      numOpenFiles,
      windowOpenedWithKnownPath,
      processSwitches
    ) => {
      const lastFileIsOfflineAndWeAreInPro =
        isInProMode && filePath && !filePath.startsWith('plottr://')
      // There are valid possibilities for filePath to be null.
      //
      // i.e. no file has ever been opened or the last opened file was
      // in a mode that doesn't match current. e.g. it's a pro file
      // and we're in classic mode.
      if (lastFileIsOfflineAndWeAreInPro) {
        promptToUploadFile(filePath)
      } else if (filePath) {
        load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
      } else {
        finishCheckingFileToLoad()
      }
      if (processSwitches.testUtilitiesEnabled) {
        enableTestUtilities()
      }
      ipcRenderer.removeListener('state-fetched', stateFetchedListener)
    }
    ipcRenderer.on('state-fetched', stateFetchedListener)
    ipcRenderer.send('pls-fetch-state', win.id, isInProMode)
    startCheckingFileToLoad()

    return () => {
      ipcRenderer.removeListener('reload-from-file', reloadListener)
    }
  }, [
    isInOfflineMode,
    readyToCheckFileToLoad,
    checkingFileToLoad,
    checkedFileToLoad,
    needsToLogin,
    promptToUploadFile,
  ])

  // A latch so that we only show initial loading splash once.
  useEffect(() => {
    if (!busyBooting && firstTimeBooting) {
      setFirstTimeBooting(false)
    }
  }, [busyBooting])

  useEffect(() => {
    setOffline(!window.navigator.onLine)
    const onlineListener = window.addEventListener('online', () => {
      setOffline(false)
    })
    const offlineListener = window.addEventListener('offline', () => {
      setOffline(true)
    })
    return () => {
      window.removeEventListener('online', onlineListener)
      window.removeEventListener('offline', offlineListener)
    }
  }, [setOffline])

  useEffect(() => {
    window.document.body.className = darkMode ? 'darkmode' : ''
  }, [darkMode])

  const closeDashboard = useCallback(() => {
    setDashboardClosed(true)
    setCurrentAppStateToApplication()
  }, [])

  // If we opened a file then don't show the dashboard all of a sudden
  // when the user changes the always show dashboard setting.
  useEffect(() => {
    // Condition is that it passes by all the other root views and
    // hits `App`.
    if (
      !firstTimeBooting &&
      !needsToLogin &&
      !isFirstTime &&
      !isInTrialModeWithExpiredTrial &&
      !(cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed))
    ) {
      closeDashboard()
      setCurrentAppStateToDashboard()
    }
  }, [
    firstTimeBooting,
    needsToLogin,
    isFirstTime,
    isInTrialModeWithExpiredTrial,
    cantShowFile,
    showDashboard,
    dashboardClosed,
  ])

  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.

  if (isOnboarding) {
    return <ProOnboarding />
  }

  if (needsToLogin) {
    return <Login />
  }

  if (fileToUpload) {
    return (
      <MainIntegrationContext.Consumer>
        {({ readFile }) => {
          return (
            <>
              <LoadingSplash />
              <UploadOfflineFile
                filePath={fileToUpload}
                onUploadFile={() => {
                  readFile(fileToUpload).then((data) => {
                    startUploadingFileToCloud()
                    uploadProject(data, emailAddress, userId).then((response) => {
                      const { fileId } = response.data || {}
                      if (!fileId) {
                        // FIXME: Use the new error loading file component
                        // here when its merged.
                        return
                      }
                      finishUploadingFileToCloud()
                      dismissPromptToUploadFile()
                      // Lie about the number of open files to avoid opening
                      // the dashboard when we double click a file.
                      //
                      // FIXME: where should the options come from?
                      bootFile(`plottr://${fileId}`, {}, 2)
                    })
                  })
                }}
                onCancel={dismissPromptToUploadFile}
                busy={uploadingFileToCloud}
              />
            </>
          )
        }}
      </MainIntegrationContext.Consumer>
    )
  }

  if (firstTimeBooting) {
    // TODO: @cameron, @jeana, this is where we can put a more
    // interesting loading component for users and let them know what
    // we're loading based on the `applicationState` key in Redux ^_^
    return <LoadingSplash loadingState={loadingState} loadingProgress={loadingProgress} />
  }

  if (isFirstTime) {
    return <Choice />
  }

  if (isInTrialModeWithExpiredTrial) {
    return <Expired />
  }

  if (cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed)) {
    return <Dashboard closeDashboard={closeDashboard} cantShowFile={cantShowFile} />
  }

  return <App forceProjectDashboard={showDashboard} />
}

Main.propTypes = {
  forceProjectDashboard: PropTypes.bool,
  busyBooting: PropTypes.bool,
  isFirstTime: PropTypes.bool,
  needsToLogin: PropTypes.bool,
  isInProMode: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
  showDashboard: PropTypes.bool,
  checkingFileToLoad: PropTypes.bool,
  checkedFileToLoad: PropTypes.bool,
  readyToCheckFileToLoad: PropTypes.bool,
  cantShowFile: PropTypes.bool,
  selectedFileIsCloudFile: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
  fileToUpload: PropTypes.string,
  uploadingFileToCloud: PropTypes.bool,
  emailAddress: PropTypes.string,
  userId: PropTypes.string,
  setOffline: PropTypes.func.isRequired,
  startCheckingFileToLoad: PropTypes.func.isRequired,
  finishCheckingFileToLoad: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isInOfflineMode: PropTypes.bool,
  currentAppStateIsDashboard: PropTypes.bool.isRequired,
  fileName: PropTypes.string,
  isOnboarding: PropTypes.bool,
  setCurrentAppStateToDashboard: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
  promptToUploadFile: PropTypes.func.isRequired,
  dismissPromptToUploadFile: PropTypes.func.isRequired,
  startUploadingFileToCloud: PropTypes.func.isRequired,
  finishUploadingFileToCloud: PropTypes.func.isRequired,
  enableTestUtilities: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    busyBooting: selectors.applicationIsBusyButFileCouldBeUnloadedSelector(state.present),
    isFirstTime: selectors.isFirstTimeSelector(state.present),
    needsToLogin: selectors.userNeedsToLoginSelector(state.present),
    isInProMode: selectors.hasProSelector(state.present),
    isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state.present),
    showDashboard: selectors.showDashboardOnBootSelector(state.present),
    checkingFileToLoad: selectors.checkingFileToLoadSelector(state.present),
    checkedFileToLoad: selectors.checkedFileToLoadSelector(state.present),
    readyToCheckFileToLoad: selectors.readyToCheckFileToLoadSelector(state.present),
    cantShowFile: selectors.cantShowFileSelector(state.present),
    selectedFileIsCloudFile: selectors.isCloudFileSelector(state.present),
    loadingState: selectors.loadingStateSelector(state.present),
    loadingProgress: selectors.loadingProgressSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
    currentAppStateIsDashboard: selectors.currentAppStateIsDashboardSelector(state.present),
    fileName: selectors.fileNameSelector(state.present),
    isOnboarding: selectors.isOnboardingToProFromRootSelector(state.present),
    fileToUpload: selectors.filePathToUploadSelector(state.present),
    uploadingFileToCloud: selectors.uploadingFileToCloudSelector(state.present),
    emailAddress: selectors.emailAddressSelector(state.present),
    userId: selectors.userIdSelector(state.present),
  }),
  {
    setOffline: actions.project.setOffline,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
    setCurrentAppStateToDashboard: actions.client.setCurrentAppStateToDashboard,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
    promptToUploadFile: actions.applicationState.promptToUploadFile,
    dismissPromptToUploadFile: actions.applicationState.dismissPromptToUploadFile,
    startUploadingFileToCloud: actions.applicationState.startUploadingFileToCloud,
    finishUploadingFileToCloud: actions.applicationState.finishUploadingFileToCloud,
    enableTestUtilities: actions.testingAndDiagnosis.enableTestUtilities,
  }
)(Main)

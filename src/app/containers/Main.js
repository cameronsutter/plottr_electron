import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer, remote } from 'electron'

import { actions, selectors } from 'pltr/v2'

import { bootFile } from '../bootFile'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'

const win = remote.getCurrentWindow()

const isCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

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
  selectedFileIsCloudFile,
  startCheckingFileToLoad,
  finishCheckingFileToLoad,
}) => {
  // The user needs a way to dismiss the files dashboard and continue
  // to the file that's open.
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)

  // I think that we need another piece of state in the application
  // state reducer: checking file to load.
  useEffect(() => {
    if (!readyToCheckFileToLoad) return () => {}

    const load = (event, filePath, options, numOpenFiles) => {
      // To boot the file automatically: we must either be running pro
      // and it's a cloud file, or we must be running classic mode and
      // it's not a cloud file.
      if (!!isInProMode === !!isCloudFile(filePath)) {
        bootFile(filePath, options, numOpenFiles)
      }
      finishCheckingFileToLoad()
    }

    // This might look like unnecessary lambda wrapping, but I've done
    // it to make sure that we have destinct lambdas to de-register
    // later.
    const reloadListener = (event, filePath, options, numOpenFiles) =>
      load(event, filePath, options, numOpenFiles)
    ipcRenderer.on('reload-from-file', reloadListener)

    if (checkedFileToLoad || checkingFileToLoad || needsToLogin) {
      return () => {
        ipcRenderer.removeListener('reload-from-file', reloadListener)
      }
    }

    startCheckingFileToLoad()
    ipcRenderer.send('pls-fetch-state', win.id)
    const stateFetchedListener = (event, filePath, options, numOpenFiles) => {
      load(event, filePath, options, numOpenFiles)
      ipcRenderer.removeListener('state-fetched', stateFetchedListener)
    }
    ipcRenderer.on('state-fetched', stateFetchedListener)

    return () => {
      ipcRenderer.removeListener('reload-from-file', reloadListener)
    }
  }, [readyToCheckFileToLoad, checkingFileToLoad, checkedFileToLoad, needsToLogin])

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

  const closeDashboard = () => {
    setDashboardClosed(true)
  }

  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.

  if (firstTimeBooting) {
    // TODO: @cameron, @jeana, this is where we can put a more
    // interesting loading component for users and let them know what
    // we're loading based on the `applicationState` key in Redux ^_^
    return (
      <div id="temporary-inner">
        <img src="../icons/logo_28_500.png" height="500" />
      </div>
    )
  }

  if (needsToLogin) {
    return <Login />
  }

  if (isFirstTime) {
    return <Choice />
  }

  if (isInTrialModeWithExpiredTrial) {
    return <Expired />
  }

  if (cantShowFile || (showDashboard && !dashboardClosed)) {
    return <Dashboard closeDashboard={closeDashboard} />
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
  setOffline: PropTypes.func.isRequired,
  startCheckingFileToLoad: PropTypes.func.isRequired,
  finishCheckingFileToLoad: PropTypes.func.isRequired,
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
    readyToCheckFileToLoad: selectors.isInSomeValidLicenseStateSelector(state.present),
    cantShowFile: selectors.cantShowFileSelector(state.present),
    selectedFileIsCloudFile: selectors.isCloudFileSelector(state.present),
  }),
  {
    setOffline: actions.project.setOffline,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
  }
)(Main)

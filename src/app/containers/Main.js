import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer, remote } from 'electron'

import { actions, selectors } from 'pltr/v2'

import { bootFile } from '../app/bootFile'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import ExpiredView from './ExpiredView'
import Dashboard from './Dashboard'

const win = remote.getCurrentWindow()

const Main = ({
  isFirstTime,
  busyBooting,
  setOffline,
  needsToLogin,
  isInTrialModeWithExpiredTrial,
  showDashboard,
}) => {
  // The user needs a way to dismiss the files dashboard and continue
  // to the file that's open.
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)

  // I think that we need another piece of state in the application
  // state reducer: checking file to load.
  useEffect(() => {
    ipcRenderer.send('pls-fetch-state', win.id)
    ipcRenderer.on('state-fetched', (event, filePath, options, numOpenFiles) => {
      bootFile(filePath, options, numOpenFiles)
    })

    ipcRenderer.on('reload-from-file', (event, filePath, options, numOpenFiles) => {
      bootFile(filePath, options, numOpenFiles)
    })
  })

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
    return <ExpiredView />
  }

  if (showDashboard && !dashboardClosed) {
    return <Dashboard closeDashboard={closeDashboard} />
  }

  return <App forceProjectDashboard={showDashboard} />
}

Main.propTypes = {
  forceProjectDashboard: PropTypes.bool,
  busyBooting: PropTypes.bool,
  isFirstTime: PropTypes.bool,
  needsToLogin: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
  showDashboard: PropTypes.bool,
  setOffline: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    busyBooting: selectors.applicationIsBusyButFileCouldBeUnloadedSelector(state.present),
    isFirstTime: selectors.isFirstTimeSelector(state.present),
    needsToLogin: selectors.userNeedsToLoginSelector(state.present),
    isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state.present),
    showDashboard: selectors.showDashboardOnBootSelector(state.present),
  }),
  { setOffline: actions.project.setOffline }
)(Main)

import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'

import App from './App'
import ChoiceView from './ChoiceView'
import Login from './Login'
import ExpiredView from './ExpiredView'
import Dashboard from './Dashboard'

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
    return <ChoiceView />
  }

  if (isInTrialModeWithExpiredTrial) {
    return <ExpiredView />
  }

  if (showDashboard && !dashboardClosed) {
    return <Dashboard closeDashboard={closeDashboard} />
  }

  // This is the case that I need to talk to Cameron about..
  // if (noFileLoaded) {
  //
  // }

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
    busyBooting: selectors.applicationIsBusyAndUninterruptableSelector(state.present),
    isFirstTime: selectors.isFirstTimeSelector(state.present),
    needsToLogin: selectors.userNeedsToLoginSelector(state.present),
    isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state.present),
    showDashboard: selectors.showDashboardOnBootSelector(state.present),
  }),
  { setOffline: actions.project.setOffline }
)(Main)

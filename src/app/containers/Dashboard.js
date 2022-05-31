import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import cx from 'classnames'

import { selectors } from 'pltr/v2'
import { DashboardBody, DashboardNav, FullPageSpinner as Spinner } from 'connected-components'

import OfflineBanner from '../components/OfflineBanner'

const Dashboard = ({ darkMode, closeDashboard, cantShowFile, busy, openTo }) => {
  const [activeView, setActiveView] = useState(openTo || 'files')

  useEffect(() => {
    const closeListener = document.addEventListener('close-dashboard', closeDashboard)
    ipcRenderer.on('reload', () => {
      window.location.reload()
    })
    return () => {
      document.removeEventListener('close-dashboard', closeListener)
    }
  }, [])

  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <OfflineBanner />
        {busy ? <Spinner /> : null}
        <DashboardNav currentView={activeView} setView={setActiveView} />
        <DashboardBody currentView={activeView} setView={setActiveView} />
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  darkMode: PropTypes.bool,
  closeDashboard: PropTypes.func.isRequired,
  cantShowFile: PropTypes.bool,
  busy: PropTypes.bool,
  openTo: PropTypes.string,
}

export default React.memo(
  connect((state) => ({
    darkMode: selectors.isDarkModeSelector(state.present),
    busy: selectors.manipulatingAFileSelector(state.present),
  }))(Dashboard)
)

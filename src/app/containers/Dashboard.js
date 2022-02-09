import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'
import { VscChromeClose } from 'react-icons/vsc'

import { selectors } from 'pltr/v2'
import { DashboardBody, DashboardNav } from 'connected-components'

import Spinner from '../components/Spinner'
import OfflineBanner from '../components/OfflineBanner'

const Dashboard = ({ darkMode, closeDashboard, cantShowFile }) => {
  const [activeView, setActiveView] = useState('files')

  useEffect(() => {
    const closeListener = document.addEventListener('close-dashboard', closeDashboard)
    return () => {
      document.removeEventListener('close-dashboard', closeListener)
    }
  }, [])

  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <OfflineBanner />
        <Spinner />
        <DashboardNav currentView={activeView} setView={setActiveView} />
        <DashboardBody currentView={activeView} setView={setActiveView}>
          {cantShowFile ? null : (
            <div className="dashboard__close-button">
              <VscChromeClose onClick={closeDashboard} />
            </div>
          )}
        </DashboardBody>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  darkMode: PropTypes.bool,
  closeDashboard: PropTypes.func.isRequired,
  cantShowFile: PropTypes.bool,
}

export default React.memo(
  connect((state) => ({
    darkMode: selectors.isDarkModeSelector(state.present),
  }))(Dashboard)
)

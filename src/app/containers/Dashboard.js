import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'
import { VscChromeClose } from 'react-icons/vsc'

import { selectors } from 'pltr/v2'
import { DashboardBody } from 'connected-components'

const Dashboard = ({ darkMode, closeDashboard }) => {
  const [activeView, setActiveView] = useState('files')

  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <DashboardBody currentView={activeView} setView={setActiveView}>
          <div className="dashboard__close-button">
            <VscChromeClose onClick={closeDashboard} />
          </div>
        </DashboardBody>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  darkMode: PropTypes.bool,
  closeDashboard: PropTypes.func.isRequired,
}

export default connect((state) => ({
  darkMode: selectors.isDarkModeSelector(state.present),
}))(Dashboard)

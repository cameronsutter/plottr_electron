import React from 'react'
import { PropTypes } from 'prop-types'
import { PlottrModal } from 'connected-components'
import cx from 'classnames'
import { VscChromeClose } from 'react-icons/vsc'

import { DashboardBody } from 'connected-components'

const modalStyles = {
  overlay: {
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    width: '95%',
    position: 'relative',
    left: '0',
    top: '0',
    minHeight: '95vh',
    maxHeight: '95vh',
  },
}

const DashboardModal = ({ activeView, darkMode, closeDashboard, setActiveView }) => (
  <PlottrModal isOpen={true} onRequestClose={closeDashboard} style={modalStyles}>
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <DashboardBody currentView={activeView} setView={setActiveView} darkMode={darkMode}>
          <div className="dashboard__close-button">
            <VscChromeClose onClick={closeDashboard} />
          </div>
        </DashboardBody>
      </div>
    </div>
  </PlottrModal>
)

DashboardModal.propTypes = {
  activeView: PropTypes.string.isRequired,
  closeDashboard: PropTypes.func.isRequired,
  setActiveView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
}

export default DashboardModal

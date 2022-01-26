import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import cx from 'classnames'
import { VscChromeClose } from 'react-icons/vsc'

import { selectors } from 'pltr/v2'
import { PlottrModal, ErrorBoundary, DashboardBody } from 'connected-components'

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

const DashboardModal = ({ activeView, darkMode, closeDashboard, setActiveView }) => {
  // Prevents the modal component from remounting when it re-renders.
  const [body, setBody] = useState(null)
  useEffect(() => {
    setBody(
      <ErrorBoundary>
        <div id="dashboard__react__root">
          <div className={cx('dashboard__main', { darkmode: darkMode })}>
            <DashboardBody currentView={activeView} setView={setActiveView}>
              <div className="dashboard__close-button">
                <VscChromeClose onClick={closeDashboard} />
              </div>
            </DashboardBody>
          </div>
        </div>
      </ErrorBoundary>
    )
  }, [darkMode])

  return (
    <PlottrModal isOpen={true} onRequestClose={closeDashboard} style={modalStyles}>
      {body}
    </PlottrModal>
  )
}

DashboardModal.propTypes = {
  activeView: PropTypes.string,
  closeDashboard: PropTypes.func.isRequired,
  setActiveView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
}

export default connect((state) => ({
  darkMode: selectors.isDarkModeSelector(state.present),
}))(DashboardModal)

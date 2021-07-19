import React from 'react'
import { PropTypes } from 'prop-types'
import { PlottrModal } from 'connected-components'
import DashboardBody from '../../dashboard/components/navigation/DashboardBody'
import DashboardNavigation from '../../dashboard/components/navigation/DashboardNavigation'
import DashboardHeader from '../../dashboard/components/navigation/DashboardHeader'

const modalStyles = {
  overlay: {
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '98%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 'calc(100vh - 50px)',
    maxHeight: 'calc(100vh - 50px)',
  },
}

const DashboardModal = ({ activeView, darkMode, closeDashboard, setActiveView }) => (
  <PlottrModal isOpen={true} onRequestClose={closeDashboard} style={modalStyles}>
    <DashboardHeader darkMode={darkMode} />
    <DashboardNavigation currentView={activeView} setView={setActiveView} />
    <DashboardBody currentView={activeView} setView={setActiveView} darkMode={darkMode} />
  </PlottrModal>
)

DashboardModal.propTypes = {
  activeView: PropTypes.string.isRequired,
  closeDashboard: PropTypes.func.isRequired,
  setActiveView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
}

export default DashboardModal

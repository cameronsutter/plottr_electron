import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import { FaRegUser, FaSignal, FaKey } from 'react-icons/fa'
import DashboardModal from './DashboardModal'
import Resume from '../components/Resume'

import { t } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import { selectors, actions } from 'pltr/v2'

const isDev = process.env.NODE_ENV == 'development'

const Navigation = ({ isInTrialMode, darkMode, currentView, changeCurrentView, isOffline }) => {
  const [dashboardView, setDashboardView] = useState(null)

  useEffect(() => {
    const openListener = document.addEventListener('open-dashboard', () => {
      setDashboardView('files')
    })
    const closeListener = document.addEventListener('close-dashboard', () => {
      setDashboardView(null)
    })
    return () => {
      document.removeEventListener('open-dashboard', openListener)
      document.removeEventListener('close-dashboard', closeListener)
    }
  }, [])

  const handleSelect = (selectedKey) => {
    changeCurrentView(selectedKey)
  }

  const TrialLinks = () => {
    if (!isInTrialMode) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => ipcRenderer.send('open-buy-window')}>
          <FaKey /> {t('Get a License')}
        </Button>
      </Navbar.Form>
    )
  }

  const openDashboard = () => {
    setDashboardView('files')
  }

  const resetDashboardView = useCallback(() => {
    setDashboardView(null)
  }, [setDashboardView])

  const selectDashboardView = (view) => {
    setDashboardView(view)
  }

  return (
    <>
      {dashboardView ? (
        <DashboardModal
          activeView={dashboardView}
          setActiveView={selectDashboardView}
          closeDashboard={resetDashboardView}
        />
      ) : null}
      {isOffline ? (
        <div className="offline-mode-banner">
          {t('Offline Mode')}
          <FaSignal />
        </div>
      ) : null}
      <Resume />
      <Navbar className="project-nav" fluid inverse={darkMode}>
        <Nav onSelect={handleSelect} activeKey={currentView} bsStyle="pills">
          <BookChooser />
          <NavItem eventKey="project">{t('Project')}</NavItem>
          <NavItem eventKey="timeline">{t('Timeline')}</NavItem>
          <NavItem eventKey="outline">{t('Outline')}</NavItem>
          <NavItem eventKey="notes">{t('Notes')}</NavItem>
          <NavItem eventKey="characters">{t('Characters')}</NavItem>
          <NavItem eventKey="places">{t('Places')}</NavItem>
          <NavItem eventKey="tags">{t('Tags')}</NavItem>
          {isDev ? (
            <NavItem eventKey="analyzer">
              Analyzer<sup>(DEV)</sup>
            </NavItem>
          ) : null}
        </Nav>
        <Beamer inNavigation />
        <TrialLinks />
        <Nav pullRight className="project-nav__options">
          <NavItem onClick={openDashboard}>
            <Button>
              <FaRegUser /> {t('Dashboard')}
            </Button>
          </NavItem>
        </Nav>
      </Navbar>
    </>
  )
}

Navigation.propTypes = {
  isInTrialMode: PropTypes.bool,
  currentView: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  changeCurrentView: PropTypes.func.isRequired,
  forceProjectDashboard: PropTypes.bool,
  isOffline: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    isInTrialMode: selectors.isInTrialModeSelector(state.present),
    currentView: selectors.currentViewSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)

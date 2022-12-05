import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FaRegUser, FaKey } from 'react-icons/fa'
import DashboardModal from './DashboardModal'
import OfflineBanner from '../components/OfflineBanner'

import { t } from 'plottr_locales'

import { Navbar, NavItem, Nav, Beamer, BookChooser, Button } from 'connected-components'
import { selectors, actions } from 'pltr/v2'
import { makeMainProcessClient } from '../mainProcessClient'

const isDev = process.env.NODE_ENV == 'development'

const { openBuyWindow } = makeMainProcessClient()

const Navigation = ({ isInTrialMode, darkMode, currentView, changeCurrentView, clickOnDom }) => {
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
      <Button bsStyle="link" onClick={() => openBuyWindow()}>
        <FaKey /> {t('Get a License')}
      </Button>
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
      <OfflineBanner />
      <Navbar
        onClick={(event) => {
          clickOnDom(event.clientX, event.clientY)
        }}
        className="project-nav"
        fluid
        inverse={darkMode}
      >
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
        <Navbar.Form pullRight className="dashboard__navbar-form">
          <TrialLinks />
          <Button onClick={openDashboard}>
            <FaRegUser /> {t('Dashboard')}
          </Button>
          <Beamer inNavigation />
        </Navbar.Form>
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
  clickOnDom: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    isInTrialMode: selectors.isInTrialModeSelector(state.present),
    currentView: selectors.currentViewSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
  }
}

export default connect(mapStateToProps, {
  changeCurrentView: actions.ui.changeCurrentView,
  clickOnDom: actions.domEvents.clickOnDom,
})(Navigation)

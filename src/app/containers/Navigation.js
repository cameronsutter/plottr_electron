import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Dropdown, MenuItem, Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser } from 'connected-components'
import { actions } from 'pltr/v2'
import { FaKey } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa'
import { FaSignal } from 'react-icons/fa'
import DashboardModal from './DashboardModal'
import { selectors } from 'pltr/v2'
import LoginModal from '../components/LoginModal'
import Resume from '../components/Resume'
import { useCallback } from 'react'

const isDev = process.env.NODE_ENV == 'development'

const Navigation = ({
  isDarkMode,
  currentView,
  changeCurrentView,
  forceProjectDashboard,
  needsLogin,
  userId, // probably don't need this
  hasCurrentProLicense,
  selectedFile,
  isCloudFile,
  checkedUser,
  isOffline,
  settings,
  started,
  expired,
  hasLicense,
}) => {
  const [checked, setChecked] = useState(false)
  const initialView = forceProjectDashboard ? 'files' : null
  const [dashboardView, setDashboardView] = useState(initialView)
  // don't show the login if user is not on Pro
  const [showFrbLogin, setShowFrbLogin] = useState((needsLogin || settings?.user?.frbId) && !userId)
  // first time = no license, no trial, no pro
  const [firstTime, setFirstTime] = useState(hasLicense && !started && !hasCurrentProLicense)
  // expired trial = no license, no pro, expired trial
  const [trialExpired, setTrialExpired] = useState(
    !hasLicense && expired && !hasCurrentProLicense
  )

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

  useEffect(() => {
    if (!selectedFile && !dashboardView && isCloudFile && checked) {
      setDashboardView('files')
    }
  }, [selectedFile, dashboardView, isCloudFile, checked])

  useEffect(() => {
    setFirstTime(!licenseInfoSize && !started && !hasCurrentProLicense)
  }, [licenseInfoSize, started, hasCurrentProLicense])

  useEffect(() => {
    setTrialExpired(!licenseInfoSize && !hasCurrentProLicense && expired)
  }, [licenseInfoSize, expired, hasCurrentProLicense])

  useEffect(() => {
    if (!firstTime && !forceProjectDashboard) {
      setDashboardView(null)
    }
  }, [firstTime])

  useEffect(() => {
    if (firstTime || trialExpired) {
      setDashboardView('account')
    }
    if (userId && !hasCurrentProLicense) {
      setDashboardView('account')
    }
  }, [licenseInfoSize, trialExpired, dashboardView, userId, hasCurrentProLicense, checked])

  useEffect(() => {
    if (!checked) return
    // setDashboardView(hasCurrentProLicense ? null : dashboardView)
    setShowFrbLogin(hasCurrentProLicense && !userId)
  }, [checked, hasCurrentProLicense, userId])

  const toggleChecking = (newVal) => {
    if (!newVal && !checked) {
      // finished check
      setChecked(true)
      checkedUser(true)
    }
  }

  const handleSelect = (selectedKey) => {
    changeCurrentView(selectedKey)
  }

  const TrialLinks = () => {
    if (!settings.trialMode || hasCurrentProLicense || isDev) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => ipcRenderer.send('open-buy-window')}>
          <FaKey /> {t('Get a License')}
        </Button>
      </Navbar.Form>
    )
  }

  const selectAccount = () => {
    setDashboardView('account')
  }

  const selectFiles = () => {
    setDashboardView('files')
  }

  const selectHelp = () => {
    setDashboardView('help')
  }

  const resetDashboardView = useCallback(() => {
    if (firstTime || trialExpired) return
    setDashboardView(null)
  }, [setDashboardView])

  const selectDashboardView = (view) => {
    setDashboardView(view)
  }

  const closeLoginModal = () => {}

  return (
    <>
      {showFrbLogin && !isOffline ? (
        <LoginModal closeLoginModal={closeLoginModal} setChecking={toggleChecking} />
      ) : null}
      {dashboardView ? (
        <DashboardModal
          activeView={dashboardView}
          setActiveView={selectDashboardView}
          closeDashboard={resetDashboardView}
          darkMode={isDarkMode}
        />
      ) : null}
      {isOffline ? (
        <div className="offline-mode-banner">
          {t('Offline Mode')}
          <FaSignal />
        </div>
      ) : null}
      <Resume />
      <Navbar className="project-nav" fluid inverse={isDarkMode}>
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
          <NavItem>
            <Dropdown id="dashboard-dropdown-menu">
              <Dropdown.Toggle noCaret bsSize="small" bsStyle="link">
                <FaRegUser />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onSelect={selectFiles}>{t('Projects')}</MenuItem>
                <MenuItem onSelect={selectAccount}>{t('Account')}</MenuItem>
                <MenuItem onSelect={selectHelp}>{t('Help')}</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </NavItem>
        </Nav>
      </Navbar>
    </>
  )
}

Navigation.propTypes = {
  currentView: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool,
  changeCurrentView: PropTypes.func.isRequired,
  forceProjectDashboard: PropTypes.bool,
  needsLogin: PropTypes.bool,
  userId: PropTypes.string,
  hasCurrentProLicense: PropTypes.bool,
  selectedFile: PropTypes.object,
  isCloudFile: PropTypes.bool,
  isOffline: PropTypes.bool,
  checkedUser: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  started: PropTypes.bool,
  expired: PropTypes.bool,
  hasLicense: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
    isDarkMode: selectors.isDarkModeSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    hasCurrentProLicense: selectors.hasProSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    settings: selectors.appSettingsSelector(state.present),
    started: selectors.trialStartedSelector(state.present),
    expired: selectors.trialExpiredSelector(state.present),
    hasLicense: selectors.hasLicenseSelector(state.present),
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)

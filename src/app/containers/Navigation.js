import React, { useEffect, useState, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Dropdown, MenuItem, Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser, ErrorBoundary } from 'connected-components'
import { actions } from 'pltr/v2'
import { FaKey } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa'
import DashboardModal from './DashboardModal'
import { selectors } from 'pltr/v2'
import { useLicenseInfo, useSettingsInfo } from '../../common/utils/store_hooks'
import { useTrialStatus } from '../../common/licensing/trial_manager'
import LoginModal from '../components/LoginModal'

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
}) => {
  const [checked, setChecked] = useState(false)
  const initialView = forceProjectDashboard ? 'files' : null
  const [dashboardView, setDashboardView] = useState(initialView)
  const [settings] = useSettingsInfo()
  const trialInfo = useTrialStatus()
  const [_licenseInfo, licenseInfoSize] = useLicenseInfo()
  // first time = no license, no trial, no pro
  const [firstTime, setFirstTime] = useState(
    !licenseInfoSize && !trialInfo.started && !hasCurrentProLicense
  )
  // don't show the login if user is not on Pro
  const [showFrbLogin, setShowFrbLogin] = useState(
    !firstTime && (needsLogin || settings?.user?.frbId) && !userId
  )
  // expired trial = no license, no pro, expired trial
  const [trialExpired, setTrialExpired] = useState(
    !licenseInfoSize && trialInfo.expired && !hasCurrentProLicense
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
    setFirstTime(!licenseInfoSize && !trialInfo.started && !hasCurrentProLicense)
  }, [licenseInfoSize, trialInfo.started, hasCurrentProLicense])

  useEffect(() => {
    setTrialExpired(!licenseInfoSize && !hasCurrentProLicense && trialInfo.expired)
  }, [licenseInfoSize, trialInfo.expired, hasCurrentProLicense])

  useEffect(() => {
    if (!firstTime && !forceProjectDashboard) {
      setDashboardView(null)
    }
  }, [firstTime])

  useEffect(() => {
    if (firstTime || trialExpired) {
      setDashboardView('account')
    }
    if (checked && userId && !hasCurrentProLicense) {
      setDashboardView('account')
    }
  }, [licenseInfoSize, trialInfo, dashboardView, userId, hasCurrentProLicense, checked])

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

  const selectTemplates = () => {
    setDashboardView('templates')
  }

  const selectHelp = () => {
    setDashboardView('help')
  }

  const resetDashboardView = () => {
    if (firstTime || trialExpired) return
    setDashboardView(null)
  }

  const selectDashboardView = (view) => {
    setDashboardView(view)
  }

  const closeLoginModal = () => {}

  return (
    <>
      {showFrbLogin ? (
        <LoginModal closeLoginModal={closeLoginModal} setChecking={toggleChecking} />
      ) : null}
      {dashboardView ? (
        <ErrorBoundary>
          <DashboardModal
            activeView={dashboardView}
            setActiveView={selectDashboardView}
            closeDashboard={resetDashboardView}
            darkMode={isDarkMode}
          />
        </ErrorBoundary>
      ) : null}
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
  checkedUser: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
    isDarkMode: selectors.isDarkModeSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    hasCurrentProLicense: selectors.hasProSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)

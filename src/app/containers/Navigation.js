import React, { useEffect, useState, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Dropdown, MenuItem, Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser } from 'connected-components'
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
  showAccount,
  userId, // probably don't need this
  hasCurrentProLicense,
  selectedFile,
  isCloudFile,
  checkedUser,
}) => {
  const initialView = showAccount ? 'account' : forceProjectDashboard ? 'files' : null
  const [dashboardView, setDashboardView] = useState(initialView)
  const [settings, _size, saveSetting] = useSettingsInfo()
  const trialInfo = useTrialStatus()
  const [_licenseInfo, licenseInfoSize] = useLicenseInfo()
  // first time = no license, no trial, no pro
  const firstTime = () => !licenseInfoSize && !trialInfo.started && !settings.user?.id
  // expired trial = no license, no pro, expired trial
  const trialExpired = () => !licenseInfoSize && !settings.user?.id && trialInfo.expired

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
    if (dashboardView !== 'account' && showAccount) {
      setDashboardView('account')
    }
  }, [showAccount, dashboardView, setDashboardView])

  useEffect(() => {
    if (!selectedFile && !dashboardView && isCloudFile && checkedUser && !showAccount) {
      setDashboardView('files')
    }
  }, [selectedFile, dashboardView, isCloudFile, checkedUser, showAccount])

  useEffect(() => {
    if (firstTime() || trialExpired()) {
      setDashboardView('account')
    }
    if (checkedUser && userId && !hasCurrentProLicense) {
      setDashboardView('account')
    }
  }, [
    licenseInfoSize,
    trialInfo,
    settings,
    dashboardView,
    userId,
    hasCurrentProLicense,
    checkedUser,
  ])

  const handleSelect = (selectedKey) => {
    changeCurrentView(selectedKey)
  }

  const TrialLinks = () => {
    if (!settings.trialMode || isDev) return null

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
    if (firstTime() || trialExpired()) return
    setDashboardView(null)
  }

  const selectDashboardView = (view) => {
    setDashboardView(view)
  }

  const closeLoginModal = () => {}

  const setUser = (user) => {
    // TODO: check that the user has Pro
    saveSetting('user.id', user.uid)
    saveSetting('user.email', user.email)
  }

  const dashbrdModal = useMemo(
    () => (
      <DashboardModal
        activeView={dashboardView}
        setActiveView={selectDashboardView}
        closeDashboard={resetDashboardView}
        darkMode={isDarkMode}
      />
    ),
    [dashboardView, isDarkMode]
  )

  // don't show the login if user is not on Pro
  const hasPro = !!settings.user?.id
  const showFrb = hasPro && !userId

  return (
    <>
      {showFrb ? <LoginModal closeLoginModal={closeLoginModal} receiveUser={setUser} /> : null}
      {dashboardView ? dashbrdModal : null}
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
  showAccount: PropTypes.bool,
  userId: PropTypes.string,
  hasCurrentProLicense: PropTypes.bool,
  selectedFile: PropTypes.object,
  isCloudFile: PropTypes.bool,
  checkedUser: PropTypes.bool,
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

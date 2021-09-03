import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Dropdown, MenuItem, Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser } from 'connected-components'
import SETTINGS from '../../common/utils/settings'
import { actions } from 'pltr/v2'
import { FaKey } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa'
import DashboardModal from './DashboardModal'
import { selectors } from 'pltr/v2'
import { useLicenseInfo } from '../../common/utils/store_hooks'
import { useTrialStatus } from '../../common/licensing/trial_manager'

const trialMode = SETTINGS.get('trialMode')
const isDev = process.env.NODE_ENV == 'development'

const Navigation = ({ isDarkMode, currentView, changeCurrentView, forceProjectDashboard }) => {
  const [dashboardView, setDashboardView] = useState(forceProjectDashboard ? 'files' : null)
  const trialInfo = useTrialStatus()
  const [_licenseInfo, licenseInfoSize] = useLicenseInfo()
  const firstTime = !licenseInfoSize && !trialInfo.started
  const trialExpired = trialInfo.expired

  useEffect(() => {
    ipcRenderer.on('open-dashboard', (event) => {
      setDashboardView('files')
    })
    ipcRenderer.on('close-dashboard', (event) => {
      setDashboardView(null)
    })
    return () => {
      ipcRenderer.removeAllListeners('open-dashboard')
      ipcRenderer.removeAllListeners('close-dashboard')
    }
  }, [])

  useEffect(() => {
    if (firstTime || trialExpired) setDashboardView('account')
  }, [firstTime, trialExpired, dashboardView])

  const handleSelect = (selectedKey) => {
    changeCurrentView(selectedKey)
  }

  const renderTrialLinks = () => {
    if (!trialMode || isDev) return null

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

  const selectOptions = () => {
    setDashboardView('options')
  }

  const selectFiles = () => {
    setDashboardView('files')
  }

  const selectTemplates = () => {
    setDashboardView('templates')
  }

  const selectBackups = () => {
    setDashboardView('backups')
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

  return (
    <>
      {dashboardView ? (
        <DashboardModal
          activeView={dashboardView}
          setActiveView={selectDashboardView}
          closeDashboard={resetDashboardView}
          darkMode={isDarkMode}
        />
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
        {renderTrialLinks()}
        <Nav pullRight className="project-nav__options">
          <NavItem>
            <Dropdown id="dashboard-dropdown-menu">
              <Dropdown.Toggle noCaret bsSize="small">
                <FaRegUser />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onSelect={selectFiles}>{t('Files')}</MenuItem>
                <MenuItem onSelect={selectOptions}>{t('Settings')}</MenuItem>
                <MenuItem onSelect={selectTemplates}>{t('Templates')}</MenuItem>
                <MenuItem onSelect={selectAccount}>{t('Account')}</MenuItem>
                <MenuItem onSelect={selectBackups}>{t('Backups')}</MenuItem>
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
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
    isDarkMode: selectors.isDarkModeSelector(state.present),
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)

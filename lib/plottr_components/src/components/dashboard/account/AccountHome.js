import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedAbout from './About'
import UnconnectedAccount from './Account'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import UnconnectedProOnboarding from './proOnboarding/index'
import UnconnectedChoiceView from './ChoiceView'
import { checkDependencies } from '../../checkDependencies'

const AccountHomeConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, useLicenseInfo },
      mpq,
    },
  } = connector
  checkDependencies({ useTrialStatus, useLicenseInfo, mpq })

  const About = UnconnectedAbout(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const Account = UnconnectedAccount(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)
  const ChoiceView = UnconnectedChoiceView(connector)

  const viewsToHideNav = ['proOnboarding', 'choice']

  const AccountHome = ({ darkMode, hasCurrentProLicense, settings }) => {
    const trialInfo = useTrialStatus()
    const [_licenseInfo, licenseInfoSize] = useLicenseInfo()
    const isFirstTime = () => !licenseInfoSize && !trialInfo.started && !hasCurrentProLicense
    const [view, setView] = useState(isFirstTime() ? 'choice' : 'account')
    const [viewIsLocked, setLock] = useState(false)
    const isOnboardingDone = settings.isOnboardingDone

    useEffect(() => {
      setLock(view == 'proOnboarding')
    }, [view])

    useEffect(() => {
      // if (!isOnboardingDone && hasPro()) startOnboarding()
    }, [isOnboardingDone])

    const handleSelect = (selectedKey) => {
      if (viewIsLocked) return
      setView(selectedKey)
    }

    const startOnboarding = () => {
      setView('proOnboarding')
    }

    const cancelOnboarding = () => {
      setView('account')
    }

    const AccountBody = () => {
      switch (view) {
        case 'choice':
          return <ChoiceView darkMode={darkMode} goToAccount={() => setView('account')} />
        case 'proOnboarding':
          return <ProOnboarding cancel={cancelOnboarding} />
        case 'account':
          return <Account darkMode={darkMode} startProOnboarding={startOnboarding} />
        case 'settings':
          return <OptionsHome />
        case 'backups':
          return <BackupsHome />
        case 'about':
          return <About />
        default:
          null
      }
    }

    const AccountNav = () => {
      if (viewsToHideNav.includes(view)) return null
      return (
        <div className="dashboard__account__nav-tabs">
          <Nav bsStyle="pills" activeKey={view} onSelect={handleSelect}>
            <NavItem eventKey="account" disabled={viewIsLocked}>
              {t('Account')}
            </NavItem>
            <NavItem eventKey="settings" disabled={viewIsLocked}>
              {t('Settings')}
            </NavItem>
            <NavItem eventKey="backups" disabled={viewIsLocked}>
              {t('Backups')}
            </NavItem>
            <NavItem eventKey="about" disabled={viewIsLocked}>
              {t('About')}
            </NavItem>
          </Nav>
        </div>
      )
    }

    return (
      <div className="dashboard__account">
        <AccountNav />
        <AccountBody />
      </div>
    )
  }

  AccountHome.propTypes = {
    darkMode: PropTypes.bool,
    hasCurrentProLicense: PropTypes.bool,
    settings: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        hasCurrentProLicense: selectors.hasProSelector(state.present),
        settings: selectors.appSettingsSelector(state.present),
      }),
      {}
    )(AccountHome)
  }

  throw new Error('Could not connect AccountHome')
}

export default AccountHomeConnector

import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedAbout from './About'
import UnconnectedAccount from './Account'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import UnconnectedProOnboarding from './proOnboarding/index'
import { checkDependencies } from '../../checkDependencies'

const AccountHomeConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, licenseStore, useLicenseInfo },
      mpq,
    },
  } = connector
  checkDependencies({ useTrialStatus, licenseStore, useLicenseInfo, mpq })

  const About = UnconnectedAbout(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const Account = UnconnectedAccount(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)

  const AccountHome = ({ darkMode }) => {
    const [view, setView] = useState('account')
    const [viewIsLocked, setLock] = useState(false)

    useEffect(() => {
      setLock(view == 'proOnboarding')
    }, [view])

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
      if (view == 'proOnboarding') return null
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
  }

  return AccountHome
}

export default AccountHomeConnector

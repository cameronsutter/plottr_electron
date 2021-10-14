import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedAbout from './About'
import UnconnectedAccount from './Account'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
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

  const AccountHome = ({ darkMode }) => {
    const [view, setView] = useState('account')
    const [dontChangeView, setDontChangeView] = useState(false)

    const lockView = () => {
      setDontChangeView(true)
    }

    const removeLock = () => {
      setDontChangeView(false)
    }

    const handleSelect = (selectedKey) => {
      if (dontChangeView) return
      setView(selectedKey)
    }

    const AccountBody = () => {
      switch (view) {
        case 'account':
          return (
            <Account
              darkMode={darkMode}
              startProOnboarding={lockView}
              cancelProOnboarding={removeLock}
            />
          )
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

    return (
      <div className="dashboard__account">
        <Nav bsStyle="pills" activeKey={view} onSelect={handleSelect}>
          <NavItem eventKey="account">{t('Account')}</NavItem>
          <NavItem eventKey="settings" disabled={dontChangeView}>
            {t('Settings')}
          </NavItem>
          <NavItem eventKey="backups" disabled={dontChangeView}>
            {t('Backups')}
          </NavItem>
          <NavItem eventKey="about" disabled={dontChangeView}>
            {t('About')}
          </NavItem>
        </Nav>
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

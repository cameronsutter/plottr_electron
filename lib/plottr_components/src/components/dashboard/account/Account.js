import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedChoiceView from './ChoiceView'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedUserInfo from './UserInfo'
import UnconnectedAbout from './About'
import UnconnectedTrialInfo from './TrialInfo'
import UnconnectedProOnboarding from './proOnboarding/'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, licenseStore, useLicenseInfo },
      mpq,
    },
  } = connector
  checkDependencies({ useTrialStatus, licenseStore, useLicenseInfo, mpq })

  const ChoiceView = UnconnectedChoiceView(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const UserInfo = UnconnectedUserInfo(connector)
  const About = UnconnectedAbout(connector)
  const TrialInfo = UnconnectedTrialInfo(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)

  const Account = (props) => {
    const [showOnboarding, setShowOnboarding] = useState(false)
    const trialInfo = useTrialStatus()
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const firstTime = !licenseInfoSize && !trialInfo.started
    const [view, setView] = useState('account')

    // const deleteLicense = () => {
    //   mpq.push('btn_remove_license_confirm')
    //   licenseStore.clear()
    // }

    // const renderUser = () => {
    //   // first time using the app
    //   if (firstTime) return <ChoiceView darkMode={props.darkMode} />

    //   // active license
    //   if (licenseInfoSize) {
    //     return (
    //       <UserInfo
    //         licenseInfo={licenseInfo}
    //         deleteLicense={deleteLicense}
    //         startPro={setShowOnboarding}
    //       />
    //     )
    //   }

    //   // free trial
    //   if (trialInfo.expired) {
    //     return <ExpiredView darkMode={props.darkMode} />
    //   } else {
    //     return <TrialInfo darkMode={props.darkMode} trialInfo={trialInfo} />
    //   }
    // }

    // const renderBelow = () => {
    //   if (firstTime) return null

    //   return (
    //     <>
    //       <hr />
    //       <About />
    //     </>
    //   )
    // }

    const handleSelect = (selectedKey) => {
      setView(selectedKey)
    }

    const AccountBody = () => {
      switch (view) {
        case 'account':
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
        {!showOnboarding ? (
          <>
            <Nav bsStyle="pills" activeKey={view} onSelect={handleSelect}>
              <NavItem eventKey="account">{t('Account')}</NavItem>
              <NavItem eventKey="settings">{t('Settings')}</NavItem>
              <NavItem eventKey="backups">{t('Backups')}</NavItem>
              <NavItem eventKey="about">{t('About')}</NavItem>
            </Nav>
            <AccountBody />
          </>
        ) : null}
        {showOnboarding ? <ProOnboarding cancel={() => setShowOnboarding(false)} /> : null}
      </div>
    )
  }

  Account.propTypes = {
    darkMode: PropTypes.bool,
  }

  return Account
}

export default AccountConnector

import React from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedChoiceView from './ChoiceView'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedLicenseInfo from './LicenseInfo'
import UnconnectedProInfo from './ProInfo'
import UnconnectedTrialInfo from './TrialInfo'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, licenseStore, useLicenseInfo, hasPro },
      openExternal,
      os,
      mpq,
    },
  } = connector
  checkDependencies({ useTrialStatus, licenseStore, useLicenseInfo, hasPro, openExternal, os, mpq })

  const ChoiceView = UnconnectedChoiceView(connector)
  const TrialInfo = UnconnectedTrialInfo(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const LicenseInfo = UnconnectedLicenseInfo(connector)
  const ProInfo = UnconnectedProInfo(connector)

  // many possible states:
  // choices,
  //  - no trialInfo
  //  - no license
  //  - no pro
  // trial
  //  - trialInfo
  //  - not expired
  //  - no license
  //  - no pro
  // trial expired
  //  - trialInfo
  //  - expired
  //  - no license
  //  - no pro
  // license
  //  - license
  // Pro
  //  - pro
  // license & Pro
  //  - license
  //  - pro
  const Account = ({ darkMode, startProOnboarding }) => {
    const trialInfo = useTrialStatus()
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const isFirstTime = () => !licenseInfoSize && !trialInfo.started && !hasPro
    const isTrial = () => trialInfo.started && !trialInfo.expired && !licenseInfoSize && !hasPro
    const isTrialExpired = () => trialInfo.expired && !licenseInfoSize && !hasPro
    const isLicense = () => !!licenseInfoSize

    const isWebOrPro = os == 'unknown' || hasPro

    const deleteLicense = () => {
      mpq.push('btn_remove_license_confirm')
      licenseStore.clear()
    }

    const handleProClick = () => {
      openExternal('https://plottr.com/pricing')
    }

    const proLink = t.rich('Want Plottr Pro? Check out <a>Plottr Pricing</a>', {
      // eslint-disable-next-line react/display-name, react/prop-types
      a: ({ children }) => (
        <a href="#" onClick={handleProClick} key="pro-link">
          {children}
        </a>
      ),
    })

    const AllAccountInfo = () => {
      if (isFirstTime()) return <ChoiceView darkMode={darkMode} />
      if (isTrial()) return <TrialInfo darkMode={darkMode} trialInfo={trialInfo} />
      if (isTrialExpired()) return <ExpiredView darkMode={darkMode} />

      const body = []
      if (hasPro) body.push(<ProInfo key="pro" />)

      if (isLicense()) {
        body.push(
          <LicenseInfo key="license" licenseInfo={licenseInfo} deleteLicense={deleteLicense} />
        )
      }

      return <>{body}</>
    }

    return (
      <div className="dashboard__account">
        <div className="dashboard__acount__top">
          <h1>{t('Account')}</h1>
          {isWebOrPro ? null : (
            <div className="text-right">
              <Button onClick={startProOnboarding}>{t('Start Plottr Pro')} 🎉</Button>
              <p className="secondary-text">{proLink}</p>
            </div>
          )}
        </div>
        <AllAccountInfo />
      </div>
    )
  }

  Account.propTypes = {
    darkMode: PropTypes.bool,
    startProOnboarding: PropTypes.func,
  }

  return Account
}

export default AccountConnector

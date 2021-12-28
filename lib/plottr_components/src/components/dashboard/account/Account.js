import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedBetaInfo from './BetaInfo'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedLicenseInfo from './LicenseInfo'
import UnconnectedProInfo from './ProInfo'
import UnconnectedTrialInfo from './TrialInfo'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { licenseStore, useLicenseInfo },
      openExternal,
      os,
      mpq,
    },
  } = connector
  checkDependencies({ licenseStore, useLicenseInfo, openExternal, os, mpq })

  const TrialInfo = UnconnectedTrialInfo(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const LicenseInfo = UnconnectedLicenseInfo(connector)
  const ProInfo = UnconnectedProInfo(connector)
  const BetaInfo = UnconnectedBetaInfo(connector)

  // TODO: Move ALL of this logic into pltr/v2/selectors/license.js
  //
  // many possible states:
  // choices (handled by AccountHome)
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
  const Account = ({ darkMode, startProOnboarding, hasCurrentProLicense, started, expired }) => {
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const checkTrial = () => started && !expired && !licenseInfoSize && !hasCurrentProLicense
    const checkTrialExpired = () => expired && !licenseInfoSize && !hasCurrentProLicense
    const checkLicense = () => !!licenseInfoSize
    const [isTrial, setIsTrial] = useState(checkTrial())
    const [isTrialExpired, setIsTrialExpired] = useState(checkTrialExpired())
    const [isLicense, setIsLicense] = useState(checkLicense())

    useEffect(() => {
      setIsTrial(checkTrial())
      setIsTrialExpired(checkTrialExpired())
      setIsLicense(checkLicense())
    }, [started, expired, licenseInfo, licenseInfoSize, hasCurrentProLicense])

    const hideProButton = os == 'unknown' || hasCurrentProLicense || isTrial

    const deleteLicense = () => {
      mpq.push('btn_remove_license_confirm')
      licenseStore.clear()
    }

    const handleProClick = () => {
      openExternal('https://m65pkjgw.paperform.co/')
    }

    const proLink = t.rich('Coming soon! <a>Learn more</a>', {
      // eslint-disable-next-line react/display-name, react/prop-types
      a: ({ children }) => (
        <a href="#" onClick={handleProClick} key="pro-link">
          {children}
        </a>
      ),
    })

    const AllAccountInfo = () => {
      if (isTrial) return <TrialInfo darkMode={darkMode} />
      if (isTrialExpired) return <ExpiredView darkMode={darkMode} />

      const body = []
      if (os == 'unknown') body.push(<BetaInfo key="beta" />)
      if (hasCurrentProLicense) body.push(<ProInfo key="pro" />)

      if (isLicense) {
        body.push(
          <LicenseInfo key="license" licenseInfo={licenseInfo} deleteLicense={deleteLicense} />
        )
      }

      return <>{body}</>
    }

    return (
      <div className="dashboard__account__body">
        <div className="dashboard__acount__top">
          <h1>{t('Account')}</h1>
          {hideProButton ? null : (
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
    hasCurrentProLicense: PropTypes.bool,
    started: PropTypes.bool,
    expired: PropTypes.bool,
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
        started: selectors.trialStartedSelector(state.present),
        expired: selectors.trialExpiredSelector(state.present),
      }),
      {}
    )(Account)
  }

  throw new Error('Could not connect Account')
}

export default AccountConnector

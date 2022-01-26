import React from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedExpiredView from './ExpiredView'
import UnconnectedLicenseInfo from './LicenseInfo'
import UnconnectedProInfo from './ProInfo'
import UnconnectedTrialInfo from './TrialInfo'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { deleteLicense },
      openExternal,
      os,
      mpq,
    },
  } = connector
  checkDependencies({ openExternal, os, mpq })

  const TrialInfo = UnconnectedTrialInfo(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const LicenseInfo = UnconnectedLicenseInfo(connector)
  const ProInfo = UnconnectedProInfo(connector)

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
  const Account = ({
    startProOnboarding,
    hasCurrentProLicense,
    hasLicense,
    isInTrialMode,
    isInTrialModeWithExpiredTrial,
  }) => {
    const hideProButton = os() == 'unknown' || hasCurrentProLicense

    const _deleteLicense = () => {
      mpq.push('btn_remove_license_confirm')
      deleteLicense()
    }

    const AllAccountInfo = () => {
      if (isInTrialMode) return <TrialInfo />
      if (isInTrialModeWithExpiredTrial) return <ExpiredView />

      const body = []
      if (hasCurrentProLicense) body.push(<ProInfo key="pro" />)

      if (hasLicense) {
        body.push(<LicenseInfo key="license" deleteLicense={_deleteLicense} />)
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
            </div>
          )}
        </div>
        <AllAccountInfo />
      </div>
    )
  }

  Account.propTypes = {
    startProOnboarding: PropTypes.func,
    hasCurrentProLicense: PropTypes.bool,
    hasLicense: PropTypes.bool,
    isInTrialMode: PropTypes.bool,
    isInTrialModeWithExpiredTrial: PropTypes.bool,
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
        hasLicense: selectors.hasLicenseSelector(state.present),
        isInTrialMode: selectors.isInTrialModeSelector(state.present),
        isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(
          state.present
        ),
      }),
      {}
    )(Account)
  }

  throw new Error('Could not connect Account')
}

export default AccountConnector

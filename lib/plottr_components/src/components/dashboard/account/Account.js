import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import UnconnectedChoiceView from './ChoiceView'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedUserInfo from './UserInfo'
import UnconnectedAbout from './About'
import UnconnectedTrialInfo from './TrialInfo'
import { checkDependencies } from '../../checkDependencies'
import UnconnectedProOnboarding from './proOnboarding/'

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
  const ProOnboarding = UnconnectedProOnboarding(connector)

  const Account = (props) => {
    const [showOnboarding, setShowOnboarding] = useState(false)
    const trialInfo = useTrialStatus()
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const firstTime = !licenseInfoSize && !trialInfo.started

    const deleteLicense = () => {
      mpq.push('btn_remove_license_confirm')
      licenseStore.clear()
    }

    const renderUser = () => {
      // first time using the app
      if (firstTime) return <ChoiceView darkMode={props.darkMode} />

      // active license
      if (licenseInfoSize) {
        return (
          <UserInfo
            licenseInfo={licenseInfo}
            deleteLicense={deleteLicense}
            startPro={setShowOnboarding}
          />
        )
      }

      // free trial
      if (trialInfo.expired) {
        return <ExpiredView darkMode={props.darkMode} />
      } else {
        return <TrialInfo darkMode={props.darkMode} trialInfo={trialInfo} />
      }
    }

    const renderBelow = () => {
      if (firstTime) return null

      return (
        <>
          <hr />
          <About />
        </>
      )
    }

    return (
      <div className="dashboard__account">
        {!showOnboarding ? (
          <>
            {renderUser()}
            {renderBelow()}
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

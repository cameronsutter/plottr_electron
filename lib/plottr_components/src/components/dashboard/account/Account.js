import React from 'react'
import PropTypes from 'react-proptypes'

import ChoiceView from './ChoiceView'
import ExpiredView from './ExpiredView'
import UserInfo from './UserInfo'
import About from './About'
import TrialInfo from './TrialInfo'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, licenseStore, useLicenseInfo },
      mpq,
    },
  } = connector

  const Account = (props) => {
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
        return <UserInfo licenseInfo={licenseInfo} deleteLicense={deleteLicense} />
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
        {renderUser()}
        {renderBelow()}
      </div>
    )
  }

  Account.propTypes = {
    darkMode: PropTypes.bool,
  }
}

export default AccountConnector

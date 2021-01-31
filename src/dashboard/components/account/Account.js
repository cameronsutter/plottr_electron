import React, { useEffect } from 'react'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import { licenseStore, useLicenseInfo } from '../../../common/utils/store_hooks'
import ChoiceView from './ChoiceView'
import ExpiredView from './ExpiredView'
import UserInfo from './UserInfo'
import About from './About'
import TrialInfo from './TrialInfo'
import MPQ from '../../../common/utils/MPQ'

export default function Account(props) {
  const trialInfo = useTrialStatus()
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()
  const firstTime = !licenseInfoSize && !trialInfo.started

  const deleteLicense = () => {
    MPQ.push('btn_remove_license_confirm')
    licenseStore.clear()
  }

  const renderUser = () => {
    // first time using the app
    if (firstTime) return <ChoiceView />

    // active license
    if (licenseInfoSize) {
      return <UserInfo licenseInfo={licenseInfo} deleteLicense={deleteLicense} />
    }

    // free trial
    if (trialInfo.expired) {
      return <ExpiredView />
    } else {
      return <TrialInfo trialInfo={trialInfo} />
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

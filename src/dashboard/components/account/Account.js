import React, { useEffect } from 'react'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import { useLicenseInfo } from '../../../common/utils/store_hooks'
import ChoiceView from './ChoiceView'
import ExpiredView from './ExpiredView'

export default function Account (props) {
  const {started, expired, daysLeft} = useTrialStatus()
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()

  // first time using the app
  if (!licenseInfoSize && !started) return <ChoiceView/>

  // active license
  if (licenseInfoSize) {
    return null
  }

  // free trial
  if (expired) {
    return <ExpiredView/>
  } else {

    return null
  }
}
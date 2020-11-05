import React from 'react'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import { useLicenseInfo } from '../../../common/utils/store_hooks'
import ChoiceView from './ChoiceView'

export default function Account (props) {
  const {started, expired, daysLeft} = useTrialStatus()
  const [licenseInfo] = useLicenseInfo()

  // first time using the app
  if (!licenseInfo.length && !started) return <ChoiceView/>

  // active license
  if (licenseInfo.length) {
    return null
  }

  // free trial
  return null
}
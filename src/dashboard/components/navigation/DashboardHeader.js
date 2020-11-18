import React from 'react'
import { is } from 'electron-util'
import t from 'format-message'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import { useLicenseInfo } from '../../../common/utils/store_hooks'

export default function DashboardHeader (props) {
  const {started, daysLeft} = useTrialStatus()
  const [licenseInfo, licenseSize] = useLicenseInfo()
  let spacer = ''
  let message = ''
  let spacer2 = ''
  let message2 = ''
  if (!licenseSize && started) {
    // in free trial
    spacer = <span className='spacer'>—</span>
    spacer2 = <span className='spacer'>—</span>
    message = <span>{t('Free Trial')}</span>
    message2 = <span>{t(`{numOfDays, plural,
      =0 {# days left}
      one {# day left}
      other {# days left}
    }`, {numOfDays: daysLeft})}</span>
  }

  if (process.env.NODE_ENV == 'development') {
    spacer = <span className='spacer'>—</span>
    message = <span>DEV</span>
  }

  if (!is.macos) {
    // render the three buttons (minimize, maximize, close)
  }
  return <div className='dashboard__header'>
    <span>{t('Plottr')}</span>
    <span className='spacer'>—</span>
    <span>{t('Dashboard')}</span>
    {spacer}
    {message}
    {spacer2}
    {message2}
  </div>
}
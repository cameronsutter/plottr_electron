import React from 'react'
import { remote } from 'electron'
import { is } from 'electron-util'
import t from 'format-message'
import { VscChromeMaximize, VscChromeMinimize, VscChromeClose } from 'react-icons/vsc'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import { useLicenseInfo } from '../../../common/utils/store_hooks'
const win = remote.getCurrentWindow()

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

  let rightButtons = null
  if (!is.macos) {
    rightButtons = <div className='nav-3right-buttons'>
      <VscChromeMinimize onClick={() => win.minimize()}/>
      <VscChromeMaximize onClick={() => win.isMaximized() ? win.unmaximize() : win.maximize()}/>
      <VscChromeClose onClick={() => window.close()}/>
    </div>
  }
  return <div className='dashboard__header'>
    <div className='nav-spacer'></div>
    <div className='nav-right'>
      <span>{t('Plottr')}</span>
      <span className='spacer'>—</span>
      <span>{t('Dashboard')}</span>
      {spacer}
      {message}
      {spacer2}
      {message2}
    </div>
    { rightButtons }
  </div>
}
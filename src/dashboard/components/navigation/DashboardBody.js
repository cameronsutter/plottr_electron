import React, { useEffect } from 'react'
import ErrorBoundary from '../../../app/containers/ErrorBoundary'
import { useLicenseInfo } from '../../../common/utils/store_hooks'
import Account from '../account/Account'
import FilesHome from '../files/FilesHome'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import UpdateNotifier from '../UpdateNotifier'
import TemplatesHome from '../templates/TemplatesHome'
import BackupsHome from '../backups/BackupsHome'
import OptionsHome from '../options/OptionsHome'
import HelpHome from '../help/HelpHome'
import { ipcRenderer } from 'electron'
import SETTINGS from '../../../common/utils/settings'

export default function DashboardBody ({currentView, setView}) {
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()
  const {started, expired, daysLeft} = useTrialStatus()

  useEffect(() => {
    ipcRenderer.send('pls-reload-menu')
    // update settings.trialMode
    if (licenseInfoSize) {
      SETTINGS.set('trialMode', false)
    } else {
      SETTINGS.set('trialMode', true)
    }
  }, [licenseInfo, licenseInfoSize, started, expired])

  // no license and trial hasn't started (first time using the app)
  // OR no license and trial is expired
  if (!licenseInfoSize && (!started || expired) && process.env.NODE_ENV !== 'development') {
    switch (currentView) {
      case 'help':
        return <Body><HelpHome/></Body>
      default:
        return <Body><Account/></Body>
    }
  }

  let body
  switch (currentView) {
    case 'account':
      body = <Account />
      break
    case 'templates':
      body = <TemplatesHome />
      break
    case 'backups':
      body = <BackupsHome />
      break
    case 'options':
      body = <OptionsHome/>
      break
    case 'help':
      body = <HelpHome/>
      break
    case 'files':
      body = <FilesHome />
      break
  }

  return <Body>{ body }</Body>
}

function Body ({children}) {
  return <div className='dashboard__body'>
    <div className='dashboard__top-border'></div>
    <UpdateNotifier />
    <ErrorBoundary>{ children }</ErrorBoundary>
  </div>
}

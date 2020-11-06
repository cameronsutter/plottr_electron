import React from 'react'
import ErrorBoundary from '../../../app/containers/ErrorBoundary'
import { useLicenseInfo, useTrialInfo } from '../../../common/utils/store_hooks'
import Account from '../account/Account'
import FilesHome from '../files/FilesHome'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import UpdateNotifier from '../UpdateNotifier'

export default function DashboardBody ({currentView, setView}) {
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()
  const {started, expired, daysLeft} = useTrialStatus()
  const [trialInfo, trialInfoSize] = useTrialInfo()

  // no license and trial hasn't started (first time using the app)
  // OR no license and trial is expired
  if (!licenseInfoSize && (!started || expired)) {
    setView('account')
    return <Body><Account/></Body>
  }

  let body
  switch (currentView) {
    case 'account':
      body = <Account />
      break
    case 'templates':
    case 'backups':
    case 'settings':
    case 'help':
    case 'files':
      body = <FilesHome />
      break
  }

  return <Body>{ body }</Body>
}

function Body ({children}) {
  return <div className='dashboard__body'>
    <UpdateNotifier />
    <ErrorBoundary>{ children }</ErrorBoundary>
  </div>
}
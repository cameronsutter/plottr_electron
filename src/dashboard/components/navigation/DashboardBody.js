import React from 'react'
import ErrorBoundary from '../../../app/containers/ErrorBoundary'
import Home from '../home/Home'
import { useLicenseInfo, useTrialInfo } from '../../../common/utils/store_hooks'
import Account from '../account/Account'


export default function DashboardBody ({currentView, setView}) {
  const [licenseInfo] = useLicenseInfo()
  const [trialInfo] = useTrialInfo()

  if (!licenseInfo.length && !trialInfo.length) {
    setView('account')
    return <Body><Account/></Body>
  }

  console.log(licenseInfo.length)
  console.log(trialInfo.length)

  let body
  switch (currentView) {
    case 'account':
    case 'home':
    case 'new':
    case 'templates':
    case 'backups':
    case 'settings':
    case 'help':
    default:
      body = <Home setView={setView}/>
  }

  return <Body>{ body }</Body>
}

function Body ({children}) {
  return <div className='dashboard__body'>
    <ErrorBoundary>{ children }</ErrorBoundary>
  </div>
}
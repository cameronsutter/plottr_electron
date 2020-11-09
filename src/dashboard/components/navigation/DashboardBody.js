import React, { useEffect, useState } from 'react'
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
import { checkForActiveLicense } from '../../../common/licensing/check_license'

export default function DashboardBody({ currentView, setView }) {
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()
  const { started, expired, daysLeft } = useTrialStatus()
  const [showAccount, setShowAccount] = useState(false)

  useEffect(() => {
    ipcRenderer.send('pls-reload-menu')
    // update settings.trialMode
    if (licenseInfoSize) {
      SETTINGS.set('trialMode', false)
    } else {
      SETTINGS.set('trialMode', true)
    }

    // no license and trial hasn't started (first time using the app)
    // OR no license and trial is expired
    if (!licenseInfoSize && (!started || expired) && process.env.NODE_ENV !== 'development') {
      setShowAccount(false)
    }
  }, [licenseInfo, licenseInfoSize, started, expired])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      checkForActiveLicense(licenseInfo, (err, success) => {
        if (!err) {
          // conscious choice not to display anything different if the license isn't active
          // that may change in the future
          // setShowAccount(!success)
        }
      })
    }
  }, [])

  // only allow these tabs in certain cases (see comment above)
  if (showAccount) {
    switch (currentView) {
      case 'help':
        return (
          <Body>
            <HelpHome />
          </Body>
        )
      default:
        return (
          <Body>
            <Account />
          </Body>
        )
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
<<<<<<< HEAD
    case 'options':
      body = <OptionsHome />
      break
=======
    case 'settings':
>>>>>>> backups page
    case 'help':
      body = <HelpHome />
      break
    case 'files':
      body = <FilesHome />
      break
  }

  return <Body>{body}</Body>
}

function Body({ children }) {
  return (
    <div className="dashboard__body">
      <div className="dashboard__top-border"></div>
      <UpdateNotifier />
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}

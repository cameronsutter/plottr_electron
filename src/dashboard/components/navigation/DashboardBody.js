import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
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
import { is } from 'electron-util'
import { Beamer, ErrorBoundary } from 'connected-components'

export default function DashboardBody({ currentView, setView, darkMode }) {
  const [licenseInfo, licenseInfoSize] = useLicenseInfo()
  const { started, expired } = useTrialStatus()
  const [showAccount, setShowAccount] = useState(false)

  useEffect(() => {
    ipcRenderer.send('pls-reload-menu')
    // update settings.trialMode
    if (licenseInfoSize) {
      SETTINGS.set('trialMode', false)
    } else {
      SETTINGS.set('trialMode', true)
      SETTINGS.set('canGetUpdates', true)
    }

    // no license and trial hasn't started (first time using the app)
    // OR no license and trial is expired
    if (!licenseInfoSize && (!started || expired) && process.env.NODE_ENV !== 'development') {
      setShowAccount(true)
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
            <Account darkMode={darkMode} />
          </Body>
        )
    }
  }

  let body
  switch (currentView) {
    case 'account':
      body = <Account darkMode={darkMode} />
      break
    case 'templates':
      body = <TemplatesHome />
      break
    case 'backups':
      body = <BackupsHome />
      break
    case 'options':
      body = <OptionsHome />
      break
    case 'help':
      body = <HelpHome />
      break
    case 'files':
      body = <FilesHome />
      break
  }

  return <Body>{body}</Body>
}

DashboardBody.propTypes = {
  currentView: PropTypes.string,
  setView: PropTypes.func,
  darkMode: PropTypes.bool,
}

function Body({ children }) {
  return (
    <div className="dashboard__body">
      <div className="dashboard__top-border"></div>
      {!is.macos ? <Beamer /> : null}
      <UpdateNotifier />
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}

Body.propTypes = {
  children: PropTypes.node,
}

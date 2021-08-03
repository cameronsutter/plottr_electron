import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedAccount from '../account/Account'
import UnconnectedFilesHome from '../files/FilesHome'
import UnconnectedUpdateNotifier from '../UpdateNotifier'
import UnconnectedTemplatesHome from '../templates/TemplatesHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedHelpHome from '../help/HelpHome'
import UnconnectedBeamer from '../../Beamer'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'

const DashboardBodyConnector = (connector) => {
  const {
    platform: {
      license: { useLicenseInfo, checkForActiveLicense, useTrialStatus },
      settings,
      reloadMenu,
      isMacOs,
    },
  } = connector

  const Beamer = UnconnectedBeamer(connector)
  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)
  const Account = UnconnectedAccount(connector)
  const FilesHome = UnconnectedFilesHome(connector)
  const UpdateNotifier = UnconnectedUpdateNotifier(connector)
  const TemplatesHome = UnconnectedTemplatesHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const HelpHome = UnconnectedHelpHome(connector)

  function Body({ children, darkMode }) {
    return (
      <div className="dashboard__body">
        <div className="dashboard__top-border"></div>
        {!isMacOs ? <Beamer /> : null}
        <UpdateNotifier />
        <DashboardErrorBoundary darkMode={darkMode}>{children}</DashboardErrorBoundary>
      </div>
    )
  }

  Body.propTypes = {
    children: PropTypes.node,
    darkMode: PropTypes.bool,
  }

  const DashboardBody = ({ currentView, setView, darkMode, children }) => {
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const { started, expired } = useTrialStatus()
    const [showAccount, setShowAccount] = useState(false)

    useEffect(() => {
      reloadMenu()
      // update settings.trialMode
      if (licenseInfoSize) {
        settings.set('trialMode', false)
      } else {
        settings.set('trialMode', true)
        settings.set('canGetUpdates', true)
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

    return (
      <Body darkMode={darkMode}>
        {children}
        {body}
      </Body>
    )
  }

  DashboardBody.propTypes = {
    currentView: PropTypes.string,
    setView: PropTypes.func,
    darkMode: PropTypes.bool,
    children: PropTypes.node,
  }

  return DashboardBody
}

export default DashboardBodyConnector

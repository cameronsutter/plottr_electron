import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedAccountHome from '../account/AccountHome'
import UnconnectedFilesHome from '../files/FilesHome'
import UnconnectedUpdateNotifier from '../UpdateNotifier'
import UnconnectedTemplatesHome from '../templates/TemplatesHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedHelpHome from '../help/HelpHome'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedErrorBoundary from '../../containers/ErrorBoundary'
import { checkDependencies } from '../../checkDependencies'

const DashboardBodyConnector = (connector) => {
  const {
    platform: {
      license: { useLicenseInfo, checkForActiveLicense, useTrialStatus },
      settings: { saveAppSetting },
      reloadMenu,
      os,
    },
  } = connector
  checkDependencies({
    useLicenseInfo,
    checkForActiveLicense,
    useTrialStatus,
    saveAppSetting,
    reloadMenu,
  })

  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const AccountHome = UnconnectedAccountHome(connector)
  const FilesHome = UnconnectedFilesHome(connector)
  const UpdateNotifier = UnconnectedUpdateNotifier(connector)
  const TemplatesHome = UnconnectedTemplatesHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const HelpHome = UnconnectedHelpHome(connector)

  function Body({ children, darkMode }) {
    return (
      <div className="dashboard__body">
        <ErrorBoundary>
          <UpdateNotifier />
        </ErrorBoundary>
        <DashboardErrorBoundary darkMode={darkMode}>{children}</DashboardErrorBoundary>
      </div>
    )
  }

  Body.propTypes = {
    children: PropTypes.node,
    darkMode: PropTypes.bool,
  }

  const DashboardBody = ({ hasCurrentProLicense, currentView, setView, darkMode, children }) => {
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const { started, expired } = useTrialStatus()
    const [showAccount, setShowAccount] = useState(false)

    useEffect(() => {
      if (os == 'unknown') return
      if (hasCurrentProLicense) return

      reloadMenu()
      // update settings.trialMode
      if (licenseInfoSize) {
        saveAppSetting('trialMode', false)
      } else {
        saveAppSetting('trialMode', true)
        saveAppSetting('canGetUpdates', true)
      }

      // no license and trial hasn't started (first time using the app)
      // OR no license and trial is expired
      if (!licenseInfoSize && (!started || expired) && process.env.NODE_ENV !== 'development') {
        setShowAccount(true)
      }
    }, [licenseInfo, licenseInfoSize, started, expired, hasCurrentProLicense])

    useEffect(() => {
      if (os == 'unknown') return
      if (hasCurrentProLicense) return
      if (process.env.NODE_ENV == 'development') return

      checkForActiveLicense(licenseInfo, (err, success) => {
        if (!err) {
          // conscious choice not to display anything different if the license isn't active
          // that may change in the future
          // setShowAccount(!success)
        }
      })
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
              <AccountHome darkMode={darkMode} />
            </Body>
          )
      }
    }

    let body
    switch (currentView) {
      case 'account':
        body = <AccountHome darkMode={darkMode} />
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
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        hasCurrentProLicense: selectors.hasProSelector(state.present),
      }),
      {}
    )(DashboardBody)
  }

  throw new Error('Could not connect DashboardBody')
}

export default DashboardBodyConnector

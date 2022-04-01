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
      license: { checkForActiveLicense },
      settings: { saveAppSetting },
      reloadMenu,
      os,
    },
  } = connector
  checkDependencies({
    checkForActiveLicense,
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

  function Body({ children }) {
    return (
      <div className="dashboard__body">
        <ErrorBoundary>
          <UpdateNotifier />
        </ErrorBoundary>
        <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
      </div>
    )
  }

  Body.propTypes = {
    children: PropTypes.node,
  }

  const DashboardBody = ({
    hasCurrentProLicense,
    currentView,
    children,
    started,
    expired,
    hasLicense,
    licenseInfo,
  }) => {
    const [showAccount, setShowAccount] = useState(false)

    useEffect(() => {
      if (hasCurrentProLicense || os() == 'unknown') {
        setShowAccount(false)
        return
      }

      reloadMenu()
      // update settings.trialMode
      if (hasLicense) {
        saveAppSetting('trialMode', false)
      } else {
        saveAppSetting('trialMode', true)
        saveAppSetting('canGetUpdates', true)
      }

      // no license and trial hasn't started (first time using the app)
      // OR no license and trial is expired
      if (!hasLicense && (!started || expired) && process.env.NODE_ENV !== 'development') {
        setShowAccount(true)
      } else {
        setShowAccount(false)
      }
    }, [licenseInfo, hasLicense, started, expired, hasCurrentProLicense])

    useEffect(() => {
      if (os() == 'unknown') return
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
              <AccountHome />
            </Body>
          )
      }
    }

    const BodySwitch = ({ currentView }) => {
      switch (currentView) {
        case 'account':
          return <AccountHome />
        case 'templates':
          return <TemplatesHome />
        case 'backups':
          return <BackupsHome />
        case 'options':
          return <OptionsHome />
        case 'help':
          return <HelpHome />
        case 'files':
          return <FilesHome />
        default:
          return null
      }
    }

    return (
      <Body>
        {children}
        <BodySwitch currentView={currentView} />
      </Body>
    )
  }

  DashboardBody.propTypes = {
    currentView: PropTypes.string,
    children: PropTypes.node,
    hasCurrentProLicense: PropTypes.bool,
    started: PropTypes.bool,
    expired: PropTypes.bool,
    hasLicense: PropTypes.bool,
    licenseInfo: PropTypes.object,
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
        started: selectors.trialStartedSelector(state.present),
        expired: selectors.trialExpiredSelector(state.present),
        hasLicense: selectors.hasLicenseSelector(state.present),
        licenseInfo: selectors.licenseInfoSelector(state.present),
      }),
      {}
    )(DashboardBody)
  }

  throw new Error('Could not connect DashboardBody')
}

export default DashboardBodyConnector

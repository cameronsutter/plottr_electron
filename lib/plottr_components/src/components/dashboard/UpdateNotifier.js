import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import cx from 'classnames'

import { t } from 'plottr_locales'

import ProgressBar from '../ProgressBar'
import { Spinner } from '../Spinner'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

const updateCheckThreshold = 1000 * 60 * 60 // 60 minutes

const UpdateNotifierConnector = (connector) => {
  const {
    platform: {
      update: {
        downloadUpdate,
        quitToInstall,
        checkForUpdates,
        onUpdateError,
        onUpdaterUpdateAvailable,
        onUpdaterUpdateNotAvailable,
        onUpdaterDownloadProgress,
        onUpdatorUpdateDownloaded,
        deregisterUpdateListeners,
      },
      openExternal,
      isMacOS,
      isWindows,
      log,
      isDevelopment,
    },
  } = connector

  checkDependencies({
    downloadUpdate,
    quitToInstall,
    checkForUpdates,
    onUpdateError,
    onUpdaterUpdateAvailable,
    onUpdaterUpdateNotAvailable,
    onUpdaterDownloadProgress,
    onUpdatorUpdateDownloaded,
    deregisterUpdateListeners,
    openExternal,
    isMacOS,
    isWindows,
    log,
    isDevelopment,
  })

  const UpdateNotifier = ({
    darkMode,
    settings,
    inDashboard,
    shouldCheck,
    available,
    downloadInProgress,
    percentDownloaded,
    finishedDownloading,
    error,
    info,
    hidden,
    checking,
    requestCheckForUpdates,
    autoCheckForUpdates,
    processResponseToRequestUpdate,
    dismissUpdateNotifier,
    setUpdateDownloadProgress,
  }) => {
    useEffect(() => {
      onUpdateError((event, error) => {
        log.warn(error)
        processResponseToRequestUpdate(false, error, null)
      })
      onUpdaterUpdateAvailable((event, info) => {
        processResponseToRequestUpdate(true, null, info)
      })
      onUpdaterUpdateNotAvailable(() => {
        processResponseToRequestUpdate(false, null, null)
      })
      onUpdaterDownloadProgress((event, progress) => {
        setUpdateDownloadProgress(percentDownloaded + 1)
        if (settings.diagnoseUpdate) {
          log.info('download-progress', progress)
        }
      })
      onUpdatorUpdateDownloaded((event, info) => {
        setUpdateDownloadProgress(100)
      })
      return () => {
        deregisterUpdateListeners()
      }
    }, [])

    useEffect(() => {
      // if (isDevelopment) {
      //   return () => {}
      // }

      if (settings.canGetUpdates) {
        const interval = setInterval(_checkForUpdates, updateCheckThreshold)
        return () => {
          clearInterval(interval)
        }
      }

      return () => {}
    }, [shouldCheck])

    const _checkForUpdates = () => {
      checkForUpdates()
      autoCheckForUpdates()
    }

    const manualDownload = () => {
      const os = isMacOS() ? 'mac' : 'win'
      const url = `https://api.plottr.com/api/latest?platform=${os}`
      openExternal(url)
    }

    const startDownload = () => {
      downloadUpdate()
      setUpdateDownloadProgress(1)
    }

    const hide = () => {
      dismissUpdateNotifier()
    }

    const renderStatus = () => {
      const version = info && info.version ? info.version : ''
      let text = ''
      if (checking) text = t('Checking for updates')
      if (inDashboard && !checking && !available) text = t("You're on the latest version")
      if (available) text = t('Update Available 🎉 (version {version})', { version })
      if (downloadInProgress) text = t('Downloading version {version}', { version: version })
      if (finishedDownloading) text = t('Download Complete 🎉 (version {version})', { version })
      if (error) {
        text = t.rich('Update failed. <b>Try again</b> or <a>install manually</a>', {
          // eslint-disable-next-line react/display-name, react/prop-types
          a: ({ children }) => (
            <a href="#" onClick={manualDownload} key="manual-download">
              {children}
            </a>
          ),
          // eslint-disable-next-line react/display-name, react/prop-types
          b: ({ children }) => (
            <a href="#" onClick={checkForUpdates} key="try-again">
              {children}
            </a>
          ),
        })
      }

      if (!text) return null
      return <span>{text}</span>
    }

    const renderAction = () => {
      if (!available && !finishedDownloading) return null
      if (downloadInProgress) return null
      return (
        <Button onClick={finishedDownloading ? quitToInstall : startDownload}>
          {finishedDownloading ? t('Click to Install') : t('Download Now!')}
        </Button>
      )
    }

    const renderProgress = () => {
      if (!downloadInProgress) return null

      if (isWindows()) {
        return <Spinner />
      }

      return (
        <ProgressBar
          bsStyle="success"
          now={percentDownloaded || 0}
          label={t('{val, number, percent}', { val: percentDownloaded / 100 })}
        />
      )
    }

    const text = renderStatus()
    if (!text) return null
    if (hidden) return null

    const floating = !inDashboard

    return (
      <div
        className={cx('update-notifier alert alert-info alert-dismissible', {
          floating,
          darkmode: darkMode,
        })}
        role="alert"
      >
        {text}
        {renderProgress()}
        <div className="update-notifier__buttons">
          {renderAction()}
          <button className="close" onClick={hide}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    )
  }

  UpdateNotifier.propTypes = {
    shouldCheck: PropTypes.bool,
    available: PropTypes.bool,
    downloadInProgress: PropTypes.bool,
    percentDownloaded: PropTypes.number,
    finishedDownloading: PropTypes.bool,
    error: PropTypes.string,
    info: PropTypes.string,
    hidden: PropTypes.bool,
    checking: PropTypes.bool,
    darkMode: PropTypes.bool,
    settings: PropTypes.object.isRequired,
    inDashboard: PropTypes.bool,
    requestCheckForUpdates: PropTypes.func.isRequired,
    autoCheckForUpdates: PropTypes.func.isRequired,
    processResponseToRequestUpdate: PropTypes.func.isRequired,
    dismissUpdateNotifier: PropTypes.func.isRequired,
    setUpdateDownloadProgress: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        shouldCheck: selectors.shouldCheckForUpdatesSelector(state.present),
        available: selectors.updateAvailableSelector(state.present),
        downloadInProgress: selectors.downloadInProgressSelector(state.present),
        percentDownloaded: selectors.percentDownloadedSelector(state.present),
        finishedDownloading: selectors.finishedDownloadingSelector(state.present),
        error: selectors.updateErrorSelector(state.present),
        info: selectors.updateInfoSelector(state.present),
        hidden: selectors.updateNotificationHiddenSelector(state.present),
        checking: selectors.checkingForUpdatesSelector(state.present),
        darkMode: selectors.isDarkModeSelector(state.present),
        settings: selectors.appSettingsSelector(state.present),
      }),
      {
        requestCheckForUpdates: actions.applicationState.requestCheckForUpdates,
        autoCheckForUpdates: actions.applicationState.autoCheckForUpdates,
        processResponseToRequestUpdate: actions.applicationState.processResponseToRequestUpdate,
        dismissUpdateNotifier: actions.applicationState.dismissUpdateNotifier,
        setUpdateDownloadProgress: actions.applicationState.setUpdateDownloadProgress,
      }
    )(UpdateNotifier)
  }

  throw new Error('Could not connect UpdateNotifier')
}

export default UpdateNotifierConnector

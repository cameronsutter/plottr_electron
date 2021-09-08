import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import Spinner from '../Spinner'
import { Button, ProgressBar } from 'react-bootstrap'
import cx from 'classnames'
import { t } from 'plottr_locales'

import { checkDependencies } from '../checkDependencies'

const updateCheckThreshold = 1000 * 60 * 60 * 3 // 3 hours

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
      settings,
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
    settings,
    isDevelopment,
  })

  const UpdateNotifier = ({ darkMode }) => {
    const [shouldCheck, setShouldCheck] = useState(true)
    const [_, setChecking] = useState(false)
    const [available, setAvailable] = useState(false)
    const [finishedChecking, setFinishedChecking] = useState(false)
    const [downloadInProgress, setDownloadInProgress] = useState(false)
    const [percentDownloaded, setPercentDownloaded] = useState(0)
    const [finishedDownloading, setFinishedDownloading] = useState(false)
    const [error, setError] = useState(null)
    const [info, setInfo] = useState(null)
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
      onUpdateError((event, error) => {
        log.warn(error)
        setError(error)
        setHidden(false)
        setChecking(false)
        setFinishedChecking(true)
        setAvailable(false)
        setTimeout(() => setFinishedChecking(false), 10000)
      })
      onUpdaterUpdateAvailable((event, info) => {
        setHidden(false)
        setChecking(false)
        setAvailable(true)
        setError(null)
        setInfo(info)
      })
      onUpdaterUpdateNotAvailable(() => {
        setHidden(false)
        setChecking(false)
        setFinishedChecking(true)
        setAvailable(false)
        setError(null)
        setTimeout(() => setFinishedChecking(false), 5000)
      })
      onUpdaterDownloadProgress((event, progress) => {
        setHidden(false)
        setDownloadInProgress(true)

        if (settings.get('diagnoseUpdate')) {
          log.info('download-progress', progress)
        }
        const percent = progress.percent || percentDownloaded + 1

        setPercentDownloaded(Math.floor(percent))
      })
      onUpdatorUpdateDownloaded((event, info) => {
        setHidden(false)
        setDownloadInProgress(false)
        setFinishedDownloading(true)
        setPercentDownloaded(100)
      })
      return () => {
        deregisterUpdateListeners()
      }
    }, [])

    useEffect(() => {
      if (isDevelopment) return
      if (shouldCheck && settings.get('canGetUpdates')) {
        _checkForUpdates()
      }
    }, [shouldCheck])

    const _checkForUpdates = () => {
      checkForUpdates()
      setError(null)
      setChecking(true)
      setTimeout(() => setChecking(false), 5000) //failsafe in case of no response
      setHidden(false)
      // reset to check every interval
      setShouldCheck(false)
      setTimeout(() => setShouldCheck(true), updateCheckThreshold)
    }

    const manualDownload = () => {
      const os = isMacOS ? 'mac' : 'win'
      const url = `https://api.plottr.com/api/latest?platform=${os}`
      openExternal(url)
    }

    const startDownload = () => {
      downloadUpdate()
      setDownloadInProgress(true)
    }

    const hide = () => {
      setHidden(true)
      setError(null)
    }

    const renderStatus = () => {
      const version = info && info.version ? info.version : ''
      let text = ''
      // if (checking) text = t('Checking for updates')
      if (finishedChecking && !available) text = t("You're on the latest version")
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

      if (isWindows) {
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

    const floating = finishedChecking && !available

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
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      darkMode: selectors.isDarkModeSelector(state.present),
    }))(UpdateNotifier)
  }

  throw new Error('Could not connect UpdateNotifier')
}

export default UpdateNotifierConnector

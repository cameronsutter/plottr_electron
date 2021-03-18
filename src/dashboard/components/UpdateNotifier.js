import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import log from 'electron-log'
import { t } from 'plottr_locales'
import cx from 'classnames'
import SETTINGS from '../../common/utils/settings'
import { Button, ProgressBar } from 'react-bootstrap'
import { is } from 'electron-util'
import { Spinner } from '../../common/components/Spinner'

const updateCheckThreshold = 1000 * 60 * 60 * 3 // 3 hours

export default function UpdateNotifier(props) {
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
    ipcRenderer.on('udpater-error', (error) => {
      log.warn(error)
      setError(error)
      setHidden(false)
      setChecking(false)
      setFinishedChecking(true)
      setAvailable(false)
      setTimeout(() => setFinishedChecking(false), 10000)
    })
    ipcRenderer.on('udpater-update-available', (info) => {
      setHidden(false)
      setChecking(false)
      setAvailable(true)
      setError(null)
      setInfo(info)
    })
    ipcRenderer.on('udpater-update-not-available', () => {
      setHidden(false)
      setChecking(false)
      setFinishedChecking(true)
      setAvailable(false)
      setError(null)
      setTimeout(() => setFinishedChecking(false), 5000)
    })
    ipcRenderer.on('udpater-download-progress', (progress) => {
      setHidden(false)
      setDownloadInProgress(true)

      if (SETTINGS.get('diagnoseUpdate')) {
        log.info('download-progress', progress)
      }
      const percent = progress.percent || percentDownloaded + 1

      setPercentDownloaded(Math.floor(percent))
    })
    ipcRenderer.on('udpater-update-downloaded', (info) => {
      setHidden(false)
      setDownloadInProgress(false)
      setFinishedDownloading(true)
      setPercentDownloaded(100)
    })
  }, [])

  useEffect(() => {
    if (is.development) return
    if (shouldCheck && SETTINGS.get('canGetUpdates')) {
      ipcRenderer.send('pls-check-for-updates')
      setError(null)
      setChecking(true)
      setTimeout(() => setChecking(false), 5000) //failsafe in case of no response
      setHidden(false)
      // reset to check every 10 minutes
      setShouldCheck(false)
      setTimeout(() => setShouldCheck(true), updateCheckThreshold)
    }
  }, [shouldCheck])

  const startDownload = () => {
    ipcRenderer.send('pls-download-update')
    setDownloadInProgress(true)
  }

  const quitToInstall = () => {
    ipcRenderer.send('pls-quit-and-install')
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
    if (error) text = t('Update failed. Try again')

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

    if (is.windows) {
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
      className={cx('update-notifier alert alert-info alert-dismissible', { floating })}
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

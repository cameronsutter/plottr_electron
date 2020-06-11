import React, { Component } from 'react'
import { ipcRenderer, shell } from 'electron'
import i18n from 'format-message'

export default class UpdateNotifier extends Component {
  state = {
    checking: false,
    available: false,
    finishedChecking: false,
    downloadInProgress: false,
    percentDownloaded: 0,
    finishedDownloading: false,
    info: null,
  }

  componentDidMount () {
    // /////
    // autoUpdater events
    // /////
    ipcRenderer.on('updater-error', (event) => {
      this.setState({checking: false, finishedChecking: true, available: false})
      setTimeout(() => this.setState({finishedChecking: false}), 5000)
    })
    ipcRenderer.on('updater-checking', (event) => {
      this.setState({checking: true})
      setTimeout(() => this.setState({checking: false}), 5000)
    })
    ipcRenderer.on('updater-update-available', (event, info) => {this.setState({checking: false, available: true, info: info})})
    ipcRenderer.on('updater-update-not-available', (event) => {
      this.setState({checking: false, finishedChecking: true, available: false})
      setTimeout(() => this.setState({finishedChecking: false}), 5000)
    })
    ipcRenderer.on('updater-downloaded', (event, info) => {this.setState({finishedDownloading: true, percentDownloaded: 100})})
    ipcRenderer.on('updater-download-progress', (event, {progress}) => {
      this.setState({downloadInProgress: true, percentDownloaded: Math.floor(progress.percent)})
    })
  }

  goToChangelog = () => {
    shell.openExternal('https://getplottr.com/changelog')
  }

  startDownload = () => {
    ipcRenderer.send('updater-doTheThing')
    this.setState({downloadInProgress: true})
  }

  quitToInstall = () => {
    ipcRenderer.send('updater-ZhuLi-doTheThing')
  }

  renderText () {
    const { checking, available, finishedChecking, downloadInProgress, percentDownloaded, finishedDownloading, info } = this.state
    const version = info && info.version ? info.version : ''
    let text = ''
    if (checking) text = i18n('Checking for updates')
    if (finishedChecking && !available) text = i18n('No updates available')
    if (available) text = i18n('Update Available ({version}): Download Now!', {version: `v${version}`})
    if (downloadInProgress) text = i18n('Downloading {version} ({percent}%)', {version: `v${version}`, percent: percentDownloaded})
    if (finishedDownloading) text = i18n('Download Complete: Click to Install ({version})', {version: `v${version}`})

    if (!text) return null
    return <span>{ text }</span>
  }

  render () {
    const text = this.renderText()
    if (!text) return null

    const { available, finishedDownloading } = this.state

    if (available || finishedDownloading) {
      return <button onClick={finishedDownloading ? this.quitToInstall : this.startDownload} className='btn-default update-notifier__wrapper'>
        {text}
      </button>
    } else {
      return <div className='update-notifier__wrapper btn-default'>{ text }</div>
    }
  }
}

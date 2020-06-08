import React, { Component } from 'react'
import { ipcRenderer, shell } from 'electron'
import i18n from 'format-message'
import { Button } from 'react-bootstrap'

export default class UpdateNotifier extends Component {
  state = {
    checking: false,
    available: true,
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
    ipcRenderer.on('updater-checking', (event) => {
      this.setState({checking: true})
      setTimeout(() => this.setState({checking: false}), 5000)
    })
    ipcRenderer.on('updater-update-available', (event, info) => {this.setState({checking: false, available: true, info: info})})
    ipcRenderer.on('updater-update-not-available', (event) => {this.setState({checking: false, available: false})})
    ipcRenderer.on('updater-downloaded', (event, info) => {this.setState({finishedDownloading: true, percentDownloaded: 100})})
    ipcRenderer.on('updater-download-progress', (event, {progress, percent, total, transferred}) => {
      console.log(progress, percent, total, transferred)
      this.setState({downloadInProgress: true, percentDownloaded: percent})
    })
  }

  goToChangelog () {
    shell.openExternal('https://getplottr.com/changelog')
  }

  renderText () {
    console.log('update info', this.state.info)
    const { checking, available, downloadInProgress, percentDownloaded, finishedDownloading } = this.state
    let text = ''
    if (checking) text = i18n('Checking for updates')
    if (available) text = <a href='#' title={i18n('See the Changelog')} onClick={this.goToChangelog}>{i18n('Update available!')}</a>
    if (downloadInProgress) text = i18n('Downloading ({percent}%)', {percent: percentDownloaded})
    if (finishedDownloading) text = i18n('Update Ready')

    if (text == '') return null
    return <span>{ text }</span>
  }

  renderButton () {
    const { available, downloadInProgress, finishedDownloading } = this.state
    let text = ''
    let fnc = () => {}
    if (available && !downloadInProgress) {
      text = i18n('Download Now')
      fnc = () => {
        ipcRenderer.send('updater-doTheThing')
        this.setState({downloadInProgress: true})
      }
    }
    if (finishedDownloading) {
      text = i18n('Quit and Install')
      fnc = () => { ipcRenderer.send('updater-ZhuLi-doTheThing') }
    }

    if (text == '') return null
    return <Button bsSize='xsmall' onClick={fnc}>{text}</Button>
  }

  render () {
    return <ul className='nav navbar-nav navbar-right update-notifier'>
      <li>
        <div>{this.renderText()}</div>
        <div>{this.renderButton()}</div>
      </li>
    </ul>
  }
}

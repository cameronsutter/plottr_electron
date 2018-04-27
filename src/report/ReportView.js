import React, { Component, PropTypes } from 'react'
import { Glyphicon } from 'react-bootstrap'
import { remote } from 'electron'
import i18n from 'format-message'

const win = remote.getCurrentWindow()
const webContents = remote.webContents

class ReportView extends Component {
  constructor (props) {
    super(props)
    this.state = {showSpinner: true, connected: navigator.onLine}
  }

  componentDidMount () {
    const webview = document.querySelector('webview')
    webview.addEventListener('dom-ready', (e) => {
      this.setState({showSpinner: false})
    })
    window.addEventListener('online', () => this.setState({connected: true}))
    window.addEventListener('offline', () => this.setState({connected: false}))
  }

  componentWillUnmount () {
    const webview = document.querySelector('webview')
    webview.removeEventListener('dom-ready')
  }

  render () {
    return <div>
      <button className='close report' dangerouslySetInnerHTML={{__html: '&times;'}} onClick={() => window.close()} />
      {this.state.showSpinner && this.renderLoading()}
      {!this.state.connected && this.renderAlert()}
      <webview id='embedded' src='https://gitreports.com/issue/cameronsutter/plottr_electron' />
    </div>
  }

  renderLoading () {
    return <span>{i18n('Loading...')}<Glyphicon id='spinner' glyph='refresh'/></span>
  }

  renderAlert () {
    return <p id='alert' className='bg-danger'>
      {i18n("It looks like you're not online. You don't always have to be online to use Plottr, but it can't report a problem offline")}
    </p>
  }
}

ReportView.propTypes = {

}

export default ReportView

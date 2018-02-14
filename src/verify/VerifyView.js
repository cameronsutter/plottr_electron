import request from 'request'
import storage from 'electron-json-storage'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const INVALID = 'invalid'
const CANTSAVE = 'cantsave'
const SAVE2 = 'save_attempt_2'
const RED = 'bg-danger'
const GREEN = 'bg-success'

class VerifyView extends Component {
  constructor (props) {
    super(props)
    var alertConst = ''
    var showAlert = false
    var connected = navigator.onLine
    if (!connected) alertConst = OFFLINE
    var alertText = this.makeAlertText(alertConst)
    if (alertText) showAlert = true
    this.state = {showAlert: showAlert, alertText: alertText, alertClass: RED, spinnerHidden: true, connected: connected}
  }

  makeAlertText (value) {
    if (value === SUCCESS) {
      return 'License Verified. Plottr will start momentarily. Thanks for being patient!'
    } else if (value === OFFLINE) {
      return 'It looks like you\'re not online. You don\'t always have to be online to user Plottr, but it can\'t verify your license offline'
    } else if (value === INVALID) {
      return 'Hmmmm. It looks like that\'s not a valid license key.'
    } else if (value === CANTSAVE) {
      return 'Plottr verified your license key successfully, but there was an error saving that. Let\'s try one more time'
    } else if (value === SAVE2) {
      return 'Nope. Plottr tried again. But it didn\'t work. Plottr will ask you next time it opens, but you\'re verified. Enjoy'
    } else {
      return null
    }
  }

  verifyLicense (license) {
    var req = {
      url: 'https://api.gumroad.com/v2/licenses/verify',
      method: 'POST',
      json: true,
      body: {
        product_permalink: 'fgSJ',
        license_key: license
      }
    }
    const view = this
    request(req, function (err, response, body) {
      var newState = {spinnerHidden: true}
      if (err && err.code === 404) {
        newState.showAlert = true
        newState.alertText = view.makeAlertText(INVALID)
      } else {
        if (body.success && !body.purchase.refunded && !body.purchase.chargebacked) {
          // save uses, purchase.email, purchase.full_name, purchase.variants
          storage.set('user_info', body, function(err) {
            if (err) {
              view.setState({showAlert: true, alertText: view.makeAlertText(CANTSAVE)})
              storage.set('user_info', body, function(err) {
                if (err) {
                  view.setState({showAlert: true, alertText: view.makeAlertText(SAVE2)})
                } else {
                  view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
                  ipcRenderer.send('license-verified')
                }
              })
            } else {
              view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
              ipcRenderer.send('license-verified')
            }
          })
        } else {
          newState.showAlert = true
          newState.alertText = view.makeAlertText(INVALID)
        }
      }
      view.setState(newState)
    })
  }

  handleVerify () {
    if (navigator.onLine) {
      var input = ReactDOM.findDOMNode(this.refs.license).children[0]
      var license = input.value
      if (license != '') {
        this.setState({spinnerHidden: false})
        this.verifyLicense(license)
      }
    } else {
      this.setState({showAlert: true, alertText: this.makeAlertText(OFFLINE)})
    }
  }

  render () {
    return (
      <div>
        <h1 className='verify'><img src='../icons/logo_10_100.png' className='verify' height='100'/> Welcome to Plottr</h1>
        <h2>Please verify your license</h2>
        <p className='text-success'>You should have received a license key from Gumroad.</p>
        <p className='text-muted'><small>(If not, please contact me @ <a href='mailto:family@plottrapp.com'>family@plottrapp.com</a> or @camsutter on Twitter)</small></p>
        <div className='form-inline'>
          <Input type='text' bsSize='large' style={{width: '400px'}} ref='license' />
          <Button bsStyle='primary' onClick={this.handleVerify.bind(this)}>Verify</Button>
          <span style={{marginLeft: '7px'}} className={this.state.spinnerHidden ? 'hidden' : ''}><Glyphicon id='spinner' glyph='refresh'/></span>
        </div>
        { this.renderAlert() }
      </div>
    )
  }

  renderAlert () {
    if (this.state.showAlert && this.state.alertText) {
      return <p id='alert' className={this.state.alertClass}>{this.state.alertText}</p>
    } else {
      return null
    }
  }
}

VerifyView.propTypes = {

}

export default VerifyView

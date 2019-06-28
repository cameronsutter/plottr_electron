import request from 'request'
import storage from 'electron-json-storage'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ReactDOM from 'react-dom'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import i18n from 'format-message'

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
      return i18n('License Verified. Plottr will start momentarily. Thanks for being patient!')
    } else if (value === OFFLINE) {
      return i18n("It looks like you're not online. You don't always have to be online to user Plottr, but it can't verify your license offline")
    } else if (value === INVALID) {
      return i18n('It looks like you have Plottr on 5 computers already or you requested a refund')
      // return i18n("Hmmmm. It looks like that's not a valid license key.")
    } else if (value === CANTSAVE) {
      return i18n("Plottr verified your license key successfully, but there was an error saving that. Let's try one more time")
    } else if (value === SAVE2) {
      return i18n("Nope. Plottr tried again. But it didn't work. Plottr will ask you next time it opens, but you're verified. Enjoy")
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
        if (body.success && !body.purchase.refunded && !body.purchase.chargebacked && body.uses <= 5) {
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
      var license = input.value.trim()
      if (license != '') {
        this.setState({spinnerHidden: false})
        this.verifyLicense(license)
      }
    } else {
      this.setState({showAlert: true, alertText: this.makeAlertText(OFFLINE)})
    }
  }

  render () {
    var contact = i18n.rich("(If not, please contact me @ <a>family@plottrapp.com</a> or @StoryPlottr on Twitter)", {
      a: ({ children }) => <a key="a" href='mailto:family@plottrapp.com'>{children}</a>
    })
    return (
      <div>
        <h1 className='verify'><img src='../icons/logo_28_100.png' className='verify' height='100'/> {i18n('Welcome to Plottr')}</h1>
        <h2>{i18n('Please verify your license')}</h2>
        <p className='text-success'>{i18n('You should have received a license key from Gumroad.')}</p>
        <p className='text-muted'><small>{contact}</small></p>
        <div className='form-inline'>
          <FormControl type='text' bsSize='large' style={{width: '400px'}} ref='license' />
          <Button bsStyle='primary' onClick={this.handleVerify.bind(this)}>{i18n('Verify')}</Button>
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

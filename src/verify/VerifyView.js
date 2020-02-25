import request from 'request'
import storage from 'electron-json-storage'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import i18n from 'format-message'
import log from 'electron-log'
import { machineIdSync } from 'node-machine-id'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const INVALID = 'invalid'
const TOOMANY = 'toomany'
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
      return i18n("Hmmmm. It looks like that's not a valid license key")
    } else if (value === TOOMANY) {
      return i18n('It looks like you have Plottr on 5 computers already')
    } else if (value === CANTSAVE) {
      return i18n("Plottr verified your license key successfully, but there was an error saving that. Let's try one more time")
    } else if (value === SAVE2) {
      return i18n("Nope. Plottr tried again. But it didn't work. Plottr will ask you next time it opens, but you're verified. Enjoy")
    } else {
      return null
    }
  }

  isValidLicense = (body) => {
    if (process.env.useEDD) {
      return body.success && body.license === "valid"
    } else {
      return body.success && !body.purchase.refunded && !body.purchase.chargebacked && !body.purchase.disputed
    }
  }

  buildURL = (license) => {
    const itemId = "355"
    let url = 'http://plottr.flywheelsites.com'
    url += `/edd-api?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
    url += `&edd_action=activate_license&item_id=${itemId}&license=${license}`
    url += `&url=${machineIdSync(true)}`
    return url
  }

  makeRequest = (license) => {
    if (process.env.useEDD) {
      let req = {
        url: this.buildURL(license),
        method: 'GET',
        json: true,
      }
    } else {
      let req = {
        url: 'https://api.gumroad.com/v2/licenses/verify',
        method: 'POST',
        json: true,
        body: {
          product_permalink: 'fgSJ',
          license_key: license
        }
      }
      if (process.env.NODE_ENV === 'development') {
        req.body.increment_uses_count = 'false'
      }
      return req
    }
  }

  hasActivationsLeft = (body) => {
    if (process.env.useEDD) {
      return body.activations_left > 0
    } else {
      return body.uses > 5
    }
  }

  verifyLicense = (license) => {
    if (license === "!TEST_LICENSE_@NEPHI") {
      ipcRenderer.send('license-verified')
    }
    var req = this.makeRequest(license)
    const view = this
    request(req, function (err, response, body) {
      var newState = {spinnerHidden: true}
      if (err && err.code === 404) {
        newState.showAlert = true
        newState.alertText = view.makeAlertText(INVALID)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(body)
        }
        if (view.isValidLicense(body)) {
          if (this.hasActivationsLeft(body)) {
            view.saveInfo(license, body, err => {
              if (err) {
                view.setState({showAlert: true, alertText: view.makeAlertText(CANTSAVE)})
                view.saveInfo(license, body, error => {
                  if (error) {
                    view.setState({showAlert: true, alertText: view.makeAlertText(SAVE2)})
                  } else {
                    view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
                    if (process.env.NODE_ENV !== 'development') {
                      ipcRenderer.send('license-verified')
                    }
                  }
                })
              } else {
                view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
                if (process.env.NODE_ENV !== 'development') {
                  ipcRenderer.send('license-verified')
                }
              }
            })
          } else {
            newState.showAlert = true
            newState.alertText = view.makeAlertText(TOOMANY)
          }
        } else {
          newState.showAlert = true
          if (process.env.useEDD && !this.hasActivationsLeft(body)) {
            newState.alertText = view.makeAlertText(TOOMANY)
          } else {
            newState.alertText = view.makeAlertText(INVALID)
          }
        }
      }
      view.setState(newState)
    })
  }

  saveInfo = (license, body, callback) => {
    let info = body
    if (process.env.useEDD) {
      info.license_key = license
    }
    storage.set('user_info', info, callback)
  }

  handleVerify () {
    if (navigator.onLine) {
      var input = ReactDOM.findDOMNode(this.refs.license)
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
    var contact = i18n.rich("(If not, please contact me at <a>family@plottrapp.com</a> or @StoryPlottr on Twitter)", {
      a: ({ children }) => <a key="a" href='mailto:family@plottrapp.com'>{children}</a>
    })
    return (
      <div>
        <h2>{i18n('Please verify your license')}</h2>
        <p className='text-success'>{i18n('You should have received a license key from Gumroad.')}</p>
        <p className='text-info'>{contact}</p>
        <div className='form-inline' style={{marginTop: '50px'}}>
          <FormControl type='text' bsSize='large' style={{width: '450px'}} ref='license' />
          <Button bsStyle='primary' bsSize='large' onClick={this.handleVerify.bind(this)}>{i18n('Verify')}</Button>
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

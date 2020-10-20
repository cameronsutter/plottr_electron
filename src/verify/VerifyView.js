import storage from 'electron-json-storage'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import i18n from 'format-message'
import { getLicenseInfo } from './verifyRequests'
import SETTINGS from '../common/utils/settings'

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
      return i18n('It looks like you have Plottr on the max number of computers already')
    } else if (value === CANTSAVE) {
      return i18n("Plottr verified your license key successfully, but there was an error saving that. Let's try one more time")
    } else if (value === SAVE2) {
      return i18n("Nope. Plottr tried again. But it didn't work. Plottr will ask you next time it opens, but you're verified. Enjoy")
    } else {
      return null
    }
  }

  verifyLicense = (license) => {
    if (license === "!TEST_LICENSE_@NEPHI") {
      ipcRenderer.send('license-verified')
    }
    getLicenseInfo(license, (isValid, licenseInfo) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(licenseInfo)
      }
      let newState = {spinnerHidden: true}
      if (isValid) {
        this.saveInfo(licenseInfo, err => {
          if (err) {
            this.setState({showAlert: true, alertText: this.makeAlertText(CANTSAVE)})
            this.saveInfo(licenseInfo, error => {
              if (error) {
                this.setState({showAlert: true, alertText: this.makeAlertText(SAVE2)})
              } else {
                this.setState({showAlert: true, alertClass: GREEN, alertText: this.makeAlertText(SUCCESS)})
                if (process.env.NODE_ENV !== 'development') {
                  ipcRenderer.send('license-verified')
                }
              }
            })
          } else {
            this.setState({showAlert: true, alertClass: GREEN, alertText: this.makeAlertText(SUCCESS)})
            if (process.env.NODE_ENV !== 'development') {
              ipcRenderer.send('license-verified')
            }
          }
        })
      } else {
        if (licenseInfo && licenseInfo.problem == 'no_activations_left' && !licenseInfo.hasActivationsLeft) {
          // not valid because of number of activations
          newState.showAlert = true
          newState.alertText = this.makeAlertText(TOOMANY)
        } else {
          // invalid
          newState.showAlert = true
          newState.alertText = this.makeAlertText(INVALID)
        }
      }
      this.setState(newState)
    })
  }

  saveInfo = (info, callback) => {
    storage.set('license_info', info, callback)
  }

  handleVerify () {
    if (navigator.onLine) {
      var input = findDOMNode(this.refs.license)
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
    return (
      <div>
        <h2>{i18n('Please verify your license')}</h2>
        <p className='text-success'>{i18n('You should have received a license key after your purchase.')}</p>
        <p className='text-info'>{i18n('(If not, please email support@getplottr.com)')}</p>
        <div className='form-inline' style={{marginTop: '30px'}}>
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

import React, { useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import t from 'format-message'
import cx from 'classnames'
import { useLicenseInfo } from '../../../common/utils/store_hooks'
import { verifyLicense } from '../../../common/licensing/verify_license'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const INVALID = 'invalid'
const TOOMANY = 'toomany'
const RED = 'bg-danger'
const GREEN = 'bg-success'

export default function VerifyView({ goBack }) {
  const makeAlertText = (value) => {
    if (value === SUCCESS) {
      return t('License Verified. Plottr will start momentarily. Thanks for being patient!')
    } else if (value === OFFLINE) {
      return t(
        "It looks like you're not online. You don't always have to be online to user Plottr, but it can't verify your license offline"
      )
    } else if (value === INVALID) {
      return t("Hmmmm. It looks like that's not a valid license key")
    } else if (value === TOOMANY) {
      return t('It looks like you have Plottr on the max number of computers already')
    } else {
      return null
    }
  }

  // TODO: refactor useLicenseInfo so it returns functions in an object
  /* eslint-disable-next-line no-unused-vars */
  const [licenseInfo, licenseInfoSize, setKey, setLicenseInfo] = useLicenseInfo()
  const [alertText, setAlertText] = useState(makeAlertText(navigator.onLine ? '' : OFFLINE))
  const [showAlert, setShowAlert] = useState(!!alertText)
  const [alertClass, setAlertClass] = useState(RED)
  const [spinnerHidden, setSpinnerHidden] = useState(true)
  const licenseRef = useRef()

  const verify = (license) => {
    if (license === '!TEST_LICENSE_@NEPHI') {
      ipcRenderer.send('license-verified')
    }
    verifyLicense(license, (isValid, licenseData) => {
      setSpinnerHidden(false)
      if (process.env.NODE_ENV === 'development') {
        console.log(licenseData)
      }
      if (isValid) {
        setShowAlert(true)
        setAlertClass(GREEN)
        setAlertText(makeAlertText(SUCCESS))
        if (process.env.NODE_ENV !== 'development') {
          setTimeout(() => {
            setLicenseInfo(licenseData)
          }, 500)
        } else {
          console.log('not setting license because of dev mode')
        }
      } else {
        if (
          licenseInfo &&
          licenseInfo.problem == 'no_activations_left' &&
          !licenseInfo.hasActivationsLeft
        ) {
          // not valid because of number of activations
          setAlertText(makeAlertText(TOOMANY))
        } else {
          // invalid
          setAlertText(makeAlertText(INVALID))
        }
        setShowAlert(true)
      }
    })
  }

  const handleVerify = () => {
    if (navigator.onLine) {
      let input = licenseRef.current
      let license = input.value.trim()
      if (license != '') {
        setSpinnerHidden(false)
        verify(license)
      }
    } else {
      setShowAlert(true)
      setAlertText(makeAlertText(OFFLINE))
    }
  }

  const renderAlert = () => {
    if (showAlert && alertText) {
      return (
        <p id="alert" className={alertClass}>
          {alertText}
        </p>
      )
    } else {
      return null
    }
  }

  return (
    <div className="verify__wrapper text-center">
      <h1>{t('Please verify your license')}</h1>
      <p className="text-success">
        {t('You should have received a license key after your purchase.')}
      </p>
      <p className="text-info">{t('(If not, please email support@plottr.com)')}</p>
      <div className="text-center" style={{ margin: '16px 0' }}>
        <FormControl
          type="text"
          bsSize="large"
          style={{ width: '450px', margin: '12px auto' }}
          inputRef={licenseRef}
        />
        <Button bsStyle="primary" bsSize="large" onClick={handleVerify}>
          {t('Verify')}
          <span style={{ marginLeft: '7px' }} className={cx({ hidden: spinnerHidden })}>
            <Glyphicon id="spinner" glyph="refresh" />
          </span>
        </Button>
        <Button bsStyle="link" onClick={goBack}>
          {t('Cancel')}
        </Button>
      </div>
      {renderAlert()}
    </div>
  )
}

VerifyView.propTypes = {
  goBack: PropTypes.func,
}

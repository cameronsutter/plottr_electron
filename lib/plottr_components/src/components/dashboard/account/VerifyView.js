import React, { useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { t } from 'plottr_locales'
import cx from 'classnames'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const INVALID = 'invalid'
const TOOMANY = 'toomany'
const RED = 'bg-danger'
const GREEN = 'bg-success'

const VerifyViewConnector = (connector) => {
  const {
    platform: {
      license: { verifyLicense, trial90days, useLicenseInfo, useTrialStatus },
      openExternal,
    },
  } = connector

  const VerifyView = ({ goBack, darkMode }) => {
    const handleAccountClick = (url) => {
      openExternal(url)
    }

    const makeAlertText = (value, paymentId) => {
      if (value === SUCCESS) {
        return t('License Verified. Plottr will start momentarily. Thanks for being patient!')
      } else if (value === OFFLINE) {
        return t(
          "It looks like you're not online. You don't always have to be online to user Plottr, but it can't verify your license offline"
        )
      } else if (value === INVALID) {
        return t("Hmmmm. It looks like that's not a valid license key")
      } else if (value === TOOMANY) {
        const url = `https://my.plottr.com/purchase-history/?action=manage_licenses&payment_id=${paymentId}`
        return t.rich(
          "It looks like you've used all your license activations. Manage or upgrade here: <a>My Plottr Account</a>",
          {
            // eslint-disable-next-line react/display-name, react/prop-types
            a: ({ children }) => (
              <a href="#" onClick={() => handleAccountClick(url)} key="account-link">
                {children}
              </a>
            ),
          }
        )
      } else {
        return null
      }
    }

    // TODO: refactor useLicenseInfo so it returns functions in an object
    /* eslint-disable-next-line no-unused-vars */
    const [licenseInfo, licenseInfoSize, setKey, setLicenseInfo] = useLicenseInfo()
    const { startTrial } = useTrialStatus()
    const [alertText, setAlertText] = useState(makeAlertText(navigator.onLine ? '' : OFFLINE))
    const [showAlert, setShowAlert] = useState(!!alertText)
    const [alertClass, setAlertClass] = useState(RED)
    const [spinnerHidden, setSpinnerHidden] = useState(true)
    const licenseRef = useRef()

    const verify = (license) => {
      // TODO: fix this (no longer works)
      // if (license === '!TEST_LICENSE_@NEPHI') {
      //   ipcRenderer.send('license-verified')
      // }
      if (trial90days.includes(license)) {
        startTrial(90)
        return
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
            licenseData &&
            licenseData.problem == 'no_activations_left' &&
            !licenseData.hasActivationsLeft
          ) {
            // not valid because of number of activations
            setAlertText(makeAlertText(TOOMANY, licenseData.payment_id))
          } else {
            // invalid
            setAlertText(makeAlertText(INVALID))
          }
          setShowAlert(true)
        }
        setSpinnerHidden(true)
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
        <p className={cx('text-success', { darkmode: darkMode })}>
          {t('You should have received a license key after your purchase.')}
        </p>
        <p className={cx('text-info', { darkmode: darkMode })}>
          {t('(If not, please email support@plottr.com)')}
        </p>
        <div className="text-center" style={{ margin: '16px 0' }}>
          <FormControl
            type="text"
            bsSize="large"
            style={{ width: '450px', margin: '12px auto' }}
            inputRef={(ref) => (licenseRef.current = ref)}
          />
          <Button bsStyle="primary" bsSize="large" onClick={handleVerify}>
            {t('Verify')}
            <span style={{ marginLeft: '7px' }} className={cx({ hidden: spinnerHidden })}>
              <Glyphicon id="spinner" glyph="refresh" />
            </span>
          </Button>
          <Button className={{ darkmode: darkMode }} bsStyle="link" onClick={goBack}>
            {t('Cancel')}
          </Button>
        </div>
        {renderAlert()}
      </div>
    )
  }

  VerifyView.propTypes = {
    goBack: PropTypes.func,
    darkMode: PropTypes.bool,
  }

  return VerifyView
}

export default VerifyViewConnector

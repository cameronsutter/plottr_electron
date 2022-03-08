import React from 'react'
import { PropTypes } from 'prop-types'
import { Button } from 'react-bootstrap'

import { t } from 'plottr_locales'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      login: { loginPopupURL },
    },
  } = connector
  checkDependencies({ loginPopupURL })

  const FirebaseLogin = ({ startLoggingIn, loggingIn }) => {
    const handleLogin = () => {
      startLoggingIn()
      window.open(
        loginPopupURL,
        'Login',
        `scrollbars=no,` +
          `resizable=no,` +
          `status=no,` +
          `location=no,` +
          `toolbar=no,` +
          `menubar=no,` +
          `width=700,` +
          `height=600,` +
          `left=500,` +
          `top=200`
      )
    }

    return (
      <div>
        <Button onClick={handleLogin} disabled={loggingIn} bsStyle="success">
          {t('Click here to log in')}
        </Button>
      </div>
    )
  }

  FirebaseLogin.propTypes = {
    loggingIn: PropTypes.bool,
    startLoggingIn: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        loggingIn: selectors.isLoggingInSelector(state.present),
      }),
      {
        startLoggingIn: actions.applicationState.startLoggingIn,
      }
    )(FirebaseLogin)
  }

  throw new Error('Could not connect FirebaseLogin')
}

export default FirebaseLoginConnector

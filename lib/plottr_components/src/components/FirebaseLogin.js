import React from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import Button from './Button'
import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      login: { launchLoginPopup },
    },
  } = connector
  checkDependencies({ launchLoginPopup })

  const FirebaseLogin = ({ startLoggingIn, loggingIn }) => {
    const handleLogin = () => {
      startLoggingIn()
      launchLoginPopup()
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

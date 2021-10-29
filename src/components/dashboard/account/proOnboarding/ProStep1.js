import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Alert, Button } from 'react-bootstrap'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepHeader } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedFirebaseLogin from '../../../FirebaseLogin'

const ProStep1Connector = (connector) => {
  const {
    platform: {
      license: { checkForPro },
      isDevelopment,
    },
  } = connector

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({ nextStep, cancel, userId, emailAddress }) => {
    const [checking, setChecking] = useState(false)
    const [noPro, setNoPro] = useState(false)

    useEffect(() => {
      if (isDevelopment) {
        nextStep()
        return
      }
      if (userId && emailAddress && !checking) {
        setChecking(true)
        checkForPro(emailAddress, handleCheckPro)
      }
    }, [nextStep, userId, emailAddress, setChecking])

    const checkUser = (user) => {
      if (user.email && !checking) {
        setChecking(true)
        checkForPro(user.email, handleCheckPro)
      }
    }

    const handleCheckPro = (hasPro) => {
      setChecking(false)
      if (hasPro) {
        nextStep()
      } else {
        setNoPro(true)
      }
    }

    const showFrb = !userId || noPro || isDevelopment

    return (
      <OnboardingStep>
        <StepHeader>
          <p>{t('Sign in with your my.plottr.com account')}</p>
          {checking ? <Spinner /> : null}
        </StepHeader>
        {noPro ? (
          <StepBody>
            <Alert bsStyle="danger">
              <h4>{t("We couldn't find a Pro account with that email")}</h4>
            </Alert>
            <Button onClick={cancel} bsSize="sm">
              {t('Cancel')}
            </Button>
          </StepBody>
        ) : null}
        <StepBody>{showFrb ? <FirebaseLogin receiveUser={checkUser} /> : null}</StepBody>
      </OnboardingStep>
    )
  }

  ProStep1.propTypes = {
    nextStep: PropTypes.func,
    cancel: PropTypes.func,
    userId: PropTypes.string,
    emailAddress: PropTypes.string,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      userId: selectors.userIdSelector(state.present),
      emailAddress: selectors.emailAddressSelector(state.present),
    }))(ProStep1)
  }

  throw new Error('Could not connect ProStep1')
}

export default ProStep1Connector

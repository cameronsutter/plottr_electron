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
      useSettingsInfo,
      license: { checkForPro },
      isDevelopment,
    },
  } = connector

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({ nextStep, cancel }) => {
    const [settings] = useSettingsInfo()
    const [checking, setChecking] = useState(false)
    const [noPro, setNoPro] = useState(false)

    useEffect(() => {
      if (isDevelopment) return
      if (settings.user.id && settings.user.email) {
        setChecking(true)
        checkForPro(settings.user.email, handleCheckPro)
      }
    }, [settings])

    const checkUser = (user) => {
      if (user.uid && user.email) {
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

    const showFrb = (settings.user && !settings.user.id) || noPro || isDevelopment

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
  }

  return ProStep1
}

export default ProStep1Connector

import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Alert, Button } from 'react-bootstrap'

import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepHeader } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedFirebaseLogin from '../../../FirebaseLogin'
import { checkDependencies } from '../../../checkDependencies'

const ProStep1Connector = (connector) => {
  const {
    platform: {
      useSettingsInfo,
      license: { checkForPro },
      isDevelopment,
    },
  } = connector
  checkDependencies({ useSettingsInfo, checkForPro, isDevelopment })

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({ nextStep, cancel, userId, emailAddress }) => {
    const [_settings, _size, saveSetting] = useSettingsInfo(false)
    const [checking, setChecking] = useState(false)
    const [noPro, setNoPro] = useState(false)

    useEffect(() => {
      if (isDevelopment && userId) {
        nextStep()
        return
      }
      if (userId && emailAddress && !checking) {
        setChecking(true)
        checkForPro(emailAddress, handleCheckPro(userId, emailAddress))
      }
    }, [nextStep, userId, emailAddress, setChecking])

    const checkUser = (user) => {
      if (isDevelopment && userId) return
      if (user.email && !checking) {
        setChecking(true)
        checkForPro(user.email, handleCheckPro(user.uid, user.email))
      }
    }

    const handleCheckPro = (uid, email) => (hasPro) => {
      setChecking(false)
      if (hasPro) {
        saveSetting('user.id', uid)
        saveSetting('user.email', email)
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

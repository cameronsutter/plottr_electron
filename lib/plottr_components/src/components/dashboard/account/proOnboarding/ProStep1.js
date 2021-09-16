import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepHeader } from '../../../onboarding/Step'
import UnconnectedFirebaseLogin from '../../../FirebaseLogin'

const ProStep1Connector = (connector) => {
  const {
    platform: { useSettingsInfo },
  } = connector

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({ nextStep }) => {
    const [settings] = useSettingsInfo()
    useEffect(() => {
      if (settings.user.id) nextStep()
    }, [settings])

    const checkUserId = (uid) => {
      if (uid) nextStep()
    }

    const showFrb = settings.user && !settings.user.id

    return (
      <OnboardingStep>
        <StepHeader>
          <p>{t('Sign in with your my.plottr.com account')}</p>
        </StepHeader>
        <StepBody>{showFrb ? <FirebaseLogin receiveUserId={checkUserId} /> : null}</StepBody>
      </OnboardingStep>
    )
  }

  ProStep1.propTypes = {
    nextStep: PropTypes.func,
  }

  return ProStep1
}

export default ProStep1Connector

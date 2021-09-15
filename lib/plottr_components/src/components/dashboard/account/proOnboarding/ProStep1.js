import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import FrbLogin from '../../../../../../../src/app/components/FrbLogin'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepHeader } from '../../../onboarding/Step'

const ProStep1Connector = (connector) => {
  const {
    platform: { useSettingsInfo },
  } = connector

  const ProStep1 = ({ nextStep }) => {
    const [settings] = useSettingsInfo()
    useEffect(() => {
      if (settings.user.id) nextStep()
    }, [])

    const checkUserId = (uid) => {
      if (uid) nextStep()
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <p>{t('Sign in with your my.plottr.com account')}</p>
        </StepHeader>
        <StepBody>
          <FrbLogin receiveUserId={checkUserId} />
        </StepBody>
      </OnboardingStep>
    )
  }

  ProStep1.propTypes = {
    nextStep: PropTypes.func,
  }

  return ProStep1
}

export default ProStep1Connector

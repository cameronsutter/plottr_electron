import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import { Button } from 'react-bootstrap'

const ProStep3Connector = (connector) => {
  const {
    platform: { useSettingsInfo },
  } = connector

  const ProStep3 = ({ finish }) => {
    const [settings] = useSettingsInfo()

    return (
      <OnboardingStep>
        <StepHeader>
          <p>{t('Settings')}</p>
        </StepHeader>
        <StepBody></StepBody>
        <StepFooter>
          <OnboardingButtonBar right>
            <p>{t('There, that was painless 😁')}</p>
            <Button bsSize="large" onClick={finish}>
              {t('Done!')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  ProStep3.propTypes = {
    finish: PropTypes.func,
  }

  return ProStep3
}

export default ProStep3Connector

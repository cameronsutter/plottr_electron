import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepFooter, StepHeader } from '../../../onboarding/Step'

export default function ProStep0({ nextStep, cancel }) {
  return (
    <OnboardingStep>
      <StepHeader>
        <h2>{t('You got Plottr Pro 🎉')}</h2>
        <p>{t("Let's get you onboarded")}</p>
      </StepHeader>
      <StepFooter>
        <OnboardingButtonBar>
          <Button bsSize="large" onClick={cancel}>
            {t('Not Now')}
          </Button>
          <Button bsSize="large" onClick={nextStep}>
            {t('Go!')}
          </Button>
        </OnboardingButtonBar>
      </StepFooter>
    </OnboardingStep>
  )
}

ProStep0.propTypes = {
  nextStep: PropTypes.func,
  cancel: PropTypes.func,
}

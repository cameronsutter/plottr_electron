import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'

export default function ProStep0({ nextStep, cancel }) {
  return (
    <OnboardingStep>
      <StepHeader>
        <h2>{t('You got Plottr Pro 🎉')}</h2>
        <p>{t("Let's get you onboarded")}</p>
      </StepHeader>
      <StepBody>
        <div className="onboarding__well">
          <p className="accented-text">
            {t("This will be quick and painless. There's only 3 steps:")}
          </p>
          <ol>
            <li>{t('Sign in')}</li>
            <li>{t('Upload projects and templates to the cloud')}</li>
            <li>{t('A few easy settings')}</li>
          </ol>
        </div>
      </StepBody>
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

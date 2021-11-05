import React from 'react'
import { Button, Jumbotron } from 'react-bootstrap'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'

export default function ProStep0({ nextStep, cancel }) {
  return (
    <OnboardingStep>
      <StepHeader>
        <h2>{t("Let's set up your Pro account")}</h2>
      </StepHeader>
      <StepBody>
        <Jumbotron>
          <p className="accented-text">
            {t('This will be quick and painless. There are only 3 steps:')}
          </p>
          <ol>
            <li>{t('Sign in')}</li>
            <li>{t('Upload your projects and templates')}</li>
            <li>{t('Configure Pro settings')}</li>
          </ol>
        </Jumbotron>
      </StepBody>
      <StepFooter>
        <OnboardingButtonBar>
          <Button onClick={cancel}>{t('Not Now')}</Button>
          <Button bsSize="large" bsStyle="success" onClick={nextStep}>
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

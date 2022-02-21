import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import ProStep0 from './ProStep0'
import UnconnectedProStep1 from './ProStep1'
import UnconnectedProStep2 from './ProStep2'
import UnconnectedProStep3 from './ProStep3'

const steps = 3

const ProOnboardingConnector = (connector) => {
  const ProStep1 = UnconnectedProStep1(connector)
  const ProStep2 = UnconnectedProStep2(connector)
  const ProStep3 = UnconnectedProStep3(connector)

  const ProOnboarding = ({ cancel, hasCurrentProLicense, step, advanceProOnboarding }) => {
    const CurrentStep = () => {
      switch (step) {
        case 1:
          return <ProStep1 nextStep={advanceProOnboarding} cancel={cancel} />
        case 2:
          return <ProStep2 nextStep={advanceProOnboarding} />
        case 3:
          return <ProStep3 finish={cancel} />
        default:
          return <ProStep0 nextStep={advanceProOnboarding} cancel={cancel} />
      }
    }

    return (
      <OnboardingFlow>
        <h1>{t('Welcome to Plottr Pro')}</h1>
        <OnboardingProgress currentStep={step} totalSteps={steps} />
        <CurrentStep />
      </OnboardingFlow>
    )
  }

  ProOnboarding.propTypes = {
    cancel: PropTypes.func,
    hasCurrentProLicense: PropTypes.bool,
    step: PropTypes.number,
    advanceProOnboarding: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          hasCurrentProLicense: selectors.hasProSelector(state.present),
          step: selectors.currentProOnboardingStepSelector(state.present),
        }
      },
      {
        advanceProOnboarding: actions.applicationState.advanceProOnboarding,
      }
    )(ProOnboarding)
  }

  throw new Error('Could not connect ProOnboarding')
}

export default ProOnboardingConnector

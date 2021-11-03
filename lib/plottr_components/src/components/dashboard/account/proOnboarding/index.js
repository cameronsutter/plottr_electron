import React, { useState } from 'react'
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
  const {
    platform: { useSettingsInfo },
  } = connector
  const ProStep1 = UnconnectedProStep1(connector)
  const ProStep2 = UnconnectedProStep2(connector)
  const ProStep3 = UnconnectedProStep3(connector)

  const ProOnboarding = ({ cancel }) => {
    // const [settings, _size, _saveSetting] = useSettingsInfo(false)
    // const [step, setStep] = useState(settings.user?.id ? 2 : 0)
    const [step, setStep] = useState(0)

    const CurrentStep = () => {
      switch (step) {
        case 1:
          return <ProStep1 nextStep={() => setStep(2)} cancel={cancel} />
        case 2:
          return <ProStep2 nextStep={() => setStep(3)} />
        case 3:
          return <ProStep3 finish={cancel} />
        default:
          return <ProStep0 nextStep={() => setStep(1)} cancel={cancel} />
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
  }

  return ProOnboarding
}

export default ProOnboardingConnector

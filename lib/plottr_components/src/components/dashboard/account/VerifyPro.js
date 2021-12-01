import React from 'react'
import PropTypes from 'react-proptypes'
import OnboardingFlow from '../../onboarding/OnboardingFlow'
import UnconnectedProStep1 from './proOnboarding/ProStep1'

const VerifyProConnector = (connector) => {
  const ProStep1 = UnconnectedProStep1(connector)

  const VerifyPro = ({ goBack, success }) => {
    return (
      <OnboardingFlow>
        <ProStep1 nextStep={success} cancel={goBack} />
      </OnboardingFlow>
    )
  }

  VerifyPro.propTypes = {
    goBack: PropTypes.func,
    success: PropTypes.func,
  }

  return VerifyPro
}

export default VerifyProConnector

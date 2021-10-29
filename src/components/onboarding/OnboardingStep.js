import React from 'react'
import PropTypes from 'react-proptypes'

export default function OnboardingStep({ children }) {
  return <div className="onboarding__step">{children}</div>
}

OnboardingStep.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

import React from 'react'
import PropTypes from 'react-proptypes'

export default function OnboardingFlow({ children }) {
  return <div className="onboarding__wrapper">{children}</div>
}

OnboardingFlow.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

import React from 'react'
import cx from 'classnames'
import PropTypes from 'react-proptypes'

export default function OnboardingButtonBar({ right, children }) {
  const klasses = cx('onboarding__button-bar', { right: right })
  return <div className={klasses}>{children}</div>
}

OnboardingButtonBar.propTypes = {
  right: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

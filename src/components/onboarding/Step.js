import React from 'react'
import PropTypes from 'react-proptypes'

export function StepHeader({ children }) {
  return <div className="step__header">{children}</div>
}

export function StepBody({ children }) {
  return <div className="step__body">{children}</div>
}

export function StepFooter({ children }) {
  return <div className="step__footer">{children}</div>
}

StepHeader.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}
StepBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}
StepFooter.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

export default function Switch({ isOn, handleToggle, labelText, disabled }) {
  const key = useRef(Math.random()).current

  return (
    <div className={cx('option-switch-wrapper', { disabled: !!disabled })}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="option-switch-checkbox"
        type="checkbox"
        id={`option-switch-${key}`}
        disabled={!!disabled}
      />
      <label
        className={cx('option-switch-label', { checked: isOn, disabled: !!disabled })}
        htmlFor={`option-switch-${key}`}
      >
        <span className={`option-switch-button`} />
      </label>
      <label htmlFor={`option-switch-${key}`} className="option-switch-labeltext">
        {labelText}
      </label>
    </div>
  )
}

Switch.propTypes = {
  isOn: PropTypes.bool,
  handleToggle: PropTypes.func,
  labelText: PropTypes.string,
  disabled: PropTypes.bool,
}

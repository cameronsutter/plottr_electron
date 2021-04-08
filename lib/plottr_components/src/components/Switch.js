import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

export default function Switch({ isOn, handleToggle, labelText, disabled }) {
  return (
    <div className={cx('option-switch-wrapper', { disabled: !!disabled })}>
      <label
        className={cx('option-switch-label', { checked: isOn, disabled: !!disabled })}
        onClick={handleToggle}
      >
        <span className={`option-switch-button`} />
      </label>
      <label className="option-switch-labeltext" onClick={handleToggle}>
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

import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

export function Checkbox({ children, checked, disabled, onChange, inline }) {
  const inputRef = useRef(null)

  const valueChange = () => {
    onChange(inputRef.current.checked)
  }

  return (
    <div className={cx('checkbox', { 'checkbox-inline': inline })}>
      <label onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={valueChange}
          ref={inputRef}
          disabled={disabled}
        />
        {children}
      </label>
    </div>
  )
}

Checkbox.propTypes = {
  children: PropTypes.element,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  inline: PropTypes.bool,
}

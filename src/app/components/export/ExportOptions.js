import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'

export function CheckOption({ children, checked, disabled, onChange, category, attr }) {
  const inputRef = useRef(null)

  const valueChange = () => {
    onChange(inputRef.current.checked, category, attr)
  }

  return (
    <div className="checkbox">
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

CheckOption.propTypes = {
  children: PropTypes.element,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  category: PropTypes.string,
  attr: PropTypes.string,
  onChange: PropTypes.func,
}

export function RadioOption({ children, checked, disabled, onChange, category, attr, value }) {
  const inputRef = useRef(null)

  const valueChange = () => {
    if (inputRef.current.checked) onChange(value, category, attr)
  }

  return (
    <div className="radio">
      <label onClick={(e) => e.stopPropagation()}>
        <input
          type="radio"
          checked={checked}
          value={value}
          onChange={valueChange}
          ref={inputRef}
          disabled={disabled}
        />
        {children}
      </label>
    </div>
  )
}

RadioOption.propTypes = {
  children: PropTypes.element,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  category: PropTypes.string,
  attr: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
}

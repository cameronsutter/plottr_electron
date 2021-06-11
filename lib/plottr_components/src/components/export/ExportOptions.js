import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

export function CheckOption({ children, checked, disabled, onChange, category, attr, inline }) {
  const inputRef = useRef(null)

  const valueChange = () => {
    onChange(inputRef.current.checked, category, attr)
  }

  return (
    <div className={cx('checkbox', { inline: inline })}>
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
  attr: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  inline: PropTypes.bool,
}

export function FilterCheckOption({
  children,
  checked,
  disabled,
  onChange,
  category,
  attr,
  inline,
  filterId,
}) {
  const inputRef = useRef(null)

  const valueChange = () => {
    onChange(inputRef.current.checked, category, attr, filterId)
  }

  return (
    <div className={cx('checkbox', { inline: inline })}>
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

FilterCheckOption.propTypes = {
  children: PropTypes.element,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  category: PropTypes.string,
  attr: PropTypes.string,
  onChange: PropTypes.func,
  inline: PropTypes.bool,
  filterId: PropTypes.number,
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

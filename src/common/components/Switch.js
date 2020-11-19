import React, { useState } from 'react'
import cx from 'classnames'

export default function Switch ({ isOn, handleToggle, labelText, disabled }) {
  const [key, setKey] = useState(Math.random())
  return <div className={cx('option-switch-wrapper', {disabled: !!disabled})}>
    <input
      checked={isOn}
      onChange={handleToggle}
      className='option-switch-checkbox'
      type='checkbox'
      id={`option-switch-${key}`}
      disabled={!!disabled}
    />
    <label
      className={cx('option-switch-label', {checked: isOn, disabled: !!disabled})}
      htmlFor={`option-switch-${key}`}
    >
      <span className={`option-switch-button`} />
    </label>
    <label htmlFor={`option-switch-${key}`} className='option-switch-labeltext'>{labelText}</label>
  </div>
}

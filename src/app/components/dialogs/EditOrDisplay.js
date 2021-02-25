import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'

import ColorPicker from 'components/colorpicker'

const EditOrDisplay = ({ editing, value, type, setValue, setEditing, options }) => {
  const [stagedValue, setStagedValue] = useState(value)
  useEffect(() => {
    setStagedValue(value)
  }, [value])

  const controlRef = React.createRef()
  useEffect(() => {
    if (controlRef.current) controlRef.current.focus()
  }, [value, editing, stagedValue])

  const extraStyle =
    type === 'color'
      ? {
          backgroundColor: value,
          width: '10px',
          height: '10px',
          marginLeft: '5px',
          marginRight: '20px',
        }
      : {}

  const ControlSwitch = ({ className }) => {
    switch (type) {
      case 'color':
        return (
          <>
            <div className="beat-config-modal__levels-table-cell">
              {stagedValue}
              <div style={extraStyle} />
            </div>
            <ColorPicker
              color={value}
              closeDialog={(value) => {
                setValue(value)
                setEditing(false)
              }}
            />
          </>
        )
      case 'text':
      default:
        return (
          <input
            className={className}
            type="text"
            value={stagedValue}
            onChange={(event) => setStagedValue(event.target.value)}
            ref={controlRef}
            onBlur={() => {
              setValue(stagedValue)
              setEditing(false)
            }}
          />
        )
    }
  }

  ControlSwitch.propTypes = {
    type: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
  }

  const DisplaySwitch = () => {
    switch (type) {
      case 'toggle':
        return (
          <input
            className="beat-config-modal__levels-table-cell beat-config-modal__toggle-control"
            type="checkbox"
            checked={stagedValue}
            onChange={(event) => setValue(event.target.checked)}
          />
        )
      case 'select':
        return (
          <div className="beat-config-modal__levels-table-cell">
            <DropdownButton bsSize="small" title={value.toLowerCase()}>
              {options.map((option) => (
                <MenuItem key={option} eventKey={option} onSelect={(key) => setValue(key)}>
                  {option.toLowerCase()}
                </MenuItem>
              ))}
            </DropdownButton>
          </div>
        )
      case 'color':
      case 'text':
      default:
        return (
          <div
            onClick={() => {
              setEditing(true)
            }}
            className="beat-config-modal__levels-table-cell"
          >
            {stagedValue}
            <div style={extraStyle} />
          </div>
        )
    }
  }

  return !editing ? (
    <DisplaySwitch />
  ) : (
    <ControlSwitch
      type="text"
      className="beat-config-modal__levels-table-cell beat-config-modal__levels-table-cell--editing"
    />
  )
}

EditOrDisplay.propTypes = {
  editing: PropTypes.bool.isRequired,
  value: PropTypes.oneOfType([(PropTypes.string, PropTypes.bool, PropTypes.number)]),
  type: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired,
  options: PropTypes.array,
}

export default EditOrDisplay

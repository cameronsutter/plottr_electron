import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem, Button, Glyphicon } from 'react-bootstrap'
import { t } from 'plottr_locales'

import ColorPickerColor from 'components/ColorPickerColor'
import ColorPicker from 'components/colorpicker'

const EditOrDisplay = ({ id, editing, value, type, setValue, setEditing, options }) => {
  const [stagedValue, setStagedValue] = useState(value)
  useEffect(() => {
    setStagedValue(value)
  }, [value])

  const controlRef = React.createRef()
  useEffect(() => {
    if (controlRef.current) controlRef.current.focus()
  }, [value, editing, stagedValue])

  const ControlSwitch = ({ className }) => {
    switch (type) {
      case 'color':
        return (
          <ColorPicker
            color={value}
            closeDialog={(value) => {
              setValue(value)
              setEditing(false)
            }}
          />
        )
      case 'number':
      case 'text':
      default:
        return (
          <input
            className={className}
            type="text"
            value={stagedValue}
            onChange={(event) => {
              const valueToSet =
                type === 'number' ? parseInt(event.target.value) : event.target.value
              if (valueToSet) setStagedValue(valueToSet)
            }}
            ref={controlRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setValue(stagedValue)
                setEditing(false)
              }
            }}
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
            <DropdownButton id={`dropdown-${id}`} bsSize="small" title={value.toLowerCase()}>
              {options.map((option) => (
                <MenuItem key={option} eventKey={option} onSelect={(key) => setValue(key)}>
                  {option.toLowerCase()}
                </MenuItem>
              ))}
            </DropdownButton>
          </div>
        )
      case 'color':
        return (
          <div className="beat-config-modal__levels-table-cell">
            <ColorPickerColor
              color={value || '#F1F5F8'} // $gray-9
              choose={() => {
                setEditing(true)
              }}
              style={{ margin: '2px' }}
            />
            <Button
              bsSize="xs"
              block
              title={t('No color')}
              bsStyle="warning"
              onClick={() => setValue('none')}
            >
              <Glyphicon glyph="ban-circle" />
            </Button>
          </div>
        )
      case 'number':
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
  id: PropTypes.string.isRequired,
  editing: PropTypes.bool.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  type: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired,
  options: PropTypes.array,
}

export default EditOrDisplay

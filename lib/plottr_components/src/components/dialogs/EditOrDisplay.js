import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem, Button, Glyphicon } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { IoIosReturnRight } from 'react-icons/io'

import UnconnectedColorPicker from '../ColorPicker'
import ColorPickerColor from '../ColorPickerColor'

const EditOrDisplayConnector = (connector) => {
  const ColorPicker = UnconnectedColorPicker(connector)

  const EditOrDisplay = ({
    id,
    editing,
    value,
    type,
    setValue,
    setEditing,
    options,
    hideArrow,
    addSpacer,
  }) => {
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
            <>
              {addSpacer ? <div className="acts-modal__levels-table-spacer" /> : null}
              <input
                className={className}
                type="text"
                value={stagedValue}
                onChange={(event) => {
                  const valueToSet =
                    type === 'number'
                      ? parseInt(event.target.value) || undefined
                      : event.target.value
                  if (valueToSet || valueToSet === '' || valueToSet === undefined)
                    setStagedValue(valueToSet)
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
            </>
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
            <div className="acts-modal__levels-table-cell align-left">
              <input
                disabled
                className="acts-modal__toggle-control"
                type="checkbox"
                checked={stagedValue}
                onChange={(event) => setValue(event.target.checked)}
              />
            </div>
          )
        case 'select':
          return (
            <div className="acts-modal__levels-table-cell">
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
            <div className="acts-modal__levels-table-cell">
              <ColorPickerColor
                color={value || '#F1F5F8'} // $gray-9
                choose={() => {
                  setEditing(true)
                }}
                style={{ margin: '2px' }}
                buttonStyle={{ border: '1px solid black' }}
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
              className="acts-modal__levels-table-cell arrow"
            >
              {addSpacer ? <div className="acts-modal__levels-spacer" /> : null}
              {!hideArrow && !addSpacer ? (
                <div className="acts-modal__levels-spacer small" />
              ) : null}
              {hideArrow ? null : <IoIosReturnRight />}
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
        className="acts-modal__levels-table-cell acts-modal__levels-table-cell--editing"
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
    hideArrow: PropTypes.bool,
    addSpacer: PropTypes.bool,
  }

  return EditOrDisplay
}

export default EditOrDisplayConnector

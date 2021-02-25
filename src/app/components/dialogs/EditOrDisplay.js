import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import ColorPicker from 'components/colorpicker'

// TODO: switch form control type with type
const EditOrDisplay = ({ editing, value, type, setValue, setEditing }) => {
  const controlRef = React.createRef()
  useEffect(() => {
    if (controlRef.current) controlRef.current.focus()
  }, [value, editing])

  const [stagedValue, setStagedValue] = useState(value)
  useEffect(() => {
    setStagedValue(value)
  }, [value])

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

  return !editing ? (
    <div
      onClick={() => {
        setEditing(true)
      }}
      className="beat-config-modal__levels-table-cell"
    >
      {stagedValue}
      <div style={extraStyle} />
    </div>
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

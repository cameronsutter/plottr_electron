import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

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

  return !editing ? (
    <div
      onClick={() => {
        setEditing(true)
      }}
      className="beat-config-modal__levels-table-cell"
    >
      {stagedValue}
    </div>
  ) : (
    <input
      className="beat-config-modal__levels-table-cell beat-config-modal__levels-table-cell--editing"
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

EditOrDisplay.propTypes = {
  editing: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired,
}

export default EditOrDisplay

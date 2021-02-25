import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FormControl } from 'react-bootstrap'

// TODO: switch form control type with type
const EditOrDisplay = ({ editing, value, type, setValue, setEditing }) => {
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
    <FormControl
      className="beat-config-modal__levels-table-cell beat-config-modal__levels-table-cell--editing"
      type="text"
      value={stagedValue}
      onChange={(event) => setStagedValue(event.target.value)}
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

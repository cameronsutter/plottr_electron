import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import EditOrDisplay from './EditOrDisplay'
import { actions } from 'pltr/v2'

const {
  hierarchyLevels: { editHierarchyLevel },
} = actions

const HierarchyLevel = ({
  name,
  level,
  autoNumber,
  textColor,
  textSize,
  borderColor,
  borderStyle,
  backgroundColor,
  editHierarchyLevel,
}) => {
  const [editingName, setEditingName] = useState(false)
  const [editingAutoNumber, setEditingAutoNumber] = useState(false)
  const [editingTextColor, setEditingTextColor] = useState(false)
  const [editingTextSize, setEditingTextSize] = useState(false)
  const [editingBorderColor, setEditingBorderColor] = useState(false)
  const [editingBorderStyle, setEditingBorderStyle] = useState(false)
  const [editingBackgroundColor, setEditingBackgroundColor] = useState(false)

  const setValue = (name) => (newValue) => {
    editHierarchyLevel({
      level: level,
      [name]: newValue,
    })
  }

  return (
    <div className="beat-config-modal__levels-table-row">
      <EditOrDisplay
        setValue={setValue('name')}
        setEditing={setEditingName}
        editing={editingName}
        value={name}
      />
      <EditOrDisplay
        setValue={setValue('autoNumber')}
        setEditing={setEditingAutoNumber}
        editing={editingAutoNumber}
        value={autoNumber}
      />
      <EditOrDisplay
        setValue={setValue('textColor')}
        setEditing={setEditingTextColor}
        editing={editingTextColor}
        value={textColor}
      />
      <EditOrDisplay
        setValue={setValue('textSize')}
        setEditing={setEditingTextSize}
        editing={editingTextSize}
        value={textSize}
      />
      <EditOrDisplay
        setValue={setValue('borderColor')}
        setEditing={setEditingBorderColor}
        editing={editingBorderColor}
        value={borderColor}
      />
      <EditOrDisplay
        setValue={setValue('borderStyle')}
        setEditing={setEditingBorderStyle}
        editing={editingBorderStyle}
        value={borderStyle}
      />
      <EditOrDisplay
        setValue={setValue('backgroundColor')}
        setEditing={setEditingBackgroundColor}
        editing={editingBackgroundColor}
        value={backgroundColor}
      />
    </div>
  )
}

HierarchyLevel.propTypes = {
  name: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  autoNumber: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  textSize: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  borderStyle: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  editHierarchyLevel: PropTypes.func.isrequired,
}

export default connect(null, { editHierarchyLevel })(HierarchyLevel)

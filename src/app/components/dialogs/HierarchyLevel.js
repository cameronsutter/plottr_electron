import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import EditOrDisplay from './EditOrDisplay'
import { actions, borderStyle as borderStyles } from 'pltr/v2'

const {
  hierarchyLevels: { editHierarchyLevel },
} = actions

const HierarchyLevel = ({
  isDarkMode,
  name,
  level,
  autoNumber,
  dark,
  light,
  textSize,
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
        id={`hierarchy-level-name-config-${level}`}
        type="text"
        setValue={setValue('name')}
        setEditing={setEditingName}
        editing={editingName}
        value={name}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-number-config-${level}`}
        type="toggle"
        setValue={setValue('autoNumber')}
        setEditing={setEditingAutoNumber}
        editing={editingAutoNumber}
        value={autoNumber}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-text-color-${level}`}
        type="color"
        setValue={setValue('textColor')}
        setEditing={setEditingTextColor}
        editing={editingTextColor}
        value={isDarkMode ? dark.textColor : light.textColor}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-text-size-${level}`}
        type="number"
        setValue={setValue('textSize')}
        setEditing={setEditingTextSize}
        editing={editingTextSize}
        value={textSize}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-border-color-${level}`}
        type="color"
        setValue={setValue('borderColor')}
        setEditing={setEditingBorderColor}
        editing={editingBorderColor}
        value={isDarkMode ? dark.borderColor : light.borderColor}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-border-style-${level}`}
        type="select"
        options={borderStyles.ALL_STYLES}
        setValue={setValue('borderStyle')}
        setEditing={setEditingBorderStyle}
        editing={editingBorderStyle}
        value={borderStyle}
      />
      <EditOrDisplay
        id={`hierarchy-level-auto-background-color-${level}`}
        type="color"
        setValue={setValue('backgroundColor')}
        setEditing={setEditingBackgroundColor}
        editing={editingBackgroundColor}
        value={backgroundColor}
      />
    </div>
  )
}

HierarchyLevel.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  autoNumber: PropTypes.bool.isRequired,
  dark: PropTypes.object.isRequired,
  light: PropTypes.object.isRequired,
  textSize: PropTypes.number.isRequired,
  borderStyle: PropTypes.oneOf(borderStyles.ALL_STYLES),
  backgroundColor: PropTypes.string.isRequired,
  editHierarchyLevel: PropTypes.func.isRequired,
}

export default connect(null, { editHierarchyLevel })(HierarchyLevel)

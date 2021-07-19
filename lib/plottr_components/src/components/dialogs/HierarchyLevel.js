import React, { useState } from 'react'
import { PropTypes } from 'prop-types'

import UnconnectedEditOrDisplay from './EditOrDisplay'
import { actions, borderStyle as borderStyles, helpers } from 'pltr/v2'

const {
  hierarchyLevels: { editHierarchyLevel },
} = actions
const {
  colors: { getBackgroundColor },
} = helpers

const HierarchyLevelConnector = (connector) => {
  const EditOrDisplay = UnconnectedEditOrDisplay(connector)

  const HierarchyLevel = ({
    isDarkMode,
    name,
    level,
    dark,
    light,
    textSize,
    borderStyle,
    backgroundColor,
    editHierarchyLevel,
    isHighest,
    isLowest,
  }) => {
    const [editingName, setEditingName] = useState(false)
    const [editingTextColor, setEditingTextColor] = useState(false)
    const [editingTextSize, setEditingTextSize] = useState(false)
    const [editingBorderColor, setEditingBorderColor] = useState(false)
    const [editingBorderStyle, setEditingBorderStyle] = useState(false)
    const [editingBackgroundColor, setEditingBackgroundColor] = useState(false)

    const theme = isDarkMode ? 'dark' : 'light'
    const textColor = isDarkMode ? dark.textColor : light.textColor
    const borderColor = isDarkMode ? dark.borderColor : light.borderColor
    const usableBackgroundColor = getBackgroundColor(backgroundColor, isDarkMode)

    const setValue = (name) => (newValue) => {
      editHierarchyLevel({
        level: level,
        [name]: newValue,
      })
    }

    const setThemedValue = (name) => (newValue) => {
      editHierarchyLevel({
        level: level,
        [name]: newValue,
        [theme]: {
          textColor,
          borderColor,
          [name]: newValue,
        },
      })
    }

    return (
      <div className="acts-modal__levels-table-row acts-tour-step4">
        <EditOrDisplay
          id={`hierarchy-level-name-config-${level}`}
          type="text"
          setValue={setValue('name')}
          setEditing={setEditingName}
          editing={editingName}
          value={name}
          hideArrow={isHighest}
          addSpacer={isLowest}
        />
        <EditOrDisplay
          id={`hierarchy-level-auto-text-color-${level}`}
          type="color"
          setValue={setThemedValue('textColor')}
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
          hideArrow={true}
        />
        <EditOrDisplay
          id={`hierarchy-level-auto-border-color-${level}`}
          type="color"
          setValue={setThemedValue('borderColor')}
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
          value={usableBackgroundColor}
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
    isHighest: PropTypes.bool.isRequired,
    isLowest: PropTypes.bool.isRequired,
  }

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect(null, { editHierarchyLevel })(HierarchyLevel)
  }

  throw new Error('Could not connect HierarchyLevel')
}

export default HierarchyLevelConnector

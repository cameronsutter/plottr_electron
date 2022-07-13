import React, { useState } from 'react'
import { PropTypes } from 'prop-types'

import DropdownButton from '../../DropdownButton'
import MenuItem from '../../MenuItem'

const UnMemoisedDefaultFontSizeDropdown = ({ defaultFontSize, onChange }) => {
  const [defaultSize, setDefaultSize] = useState(defaultFontSize || 20)

  const changeSize = (size) => {
    setDefaultSize(Number(size))
    onChange(Number(size))
  }

  const renderSizes = () => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 4; size <= maxfontSize; size++) {
      sizeArray.push(
        <MenuItem key={`fontSize-${size}`} eventKey={size} active={defaultSize == size}>
          {size}
        </MenuItem>
      )
    }
    return sizeArray
  }

  return (
    <DropdownButton
      className="size-picker"
      title={defaultSize}
      onSelect={changeSize}
      id="size-dropdown"
    >
      {renderSizes()}
    </DropdownButton>
  )
}

UnMemoisedDefaultFontSizeDropdown.propTypes = {
  defaultFontSize: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export const DefaultFontSizeDropdown = React.memo(UnMemoisedDefaultFontSizeDropdown)

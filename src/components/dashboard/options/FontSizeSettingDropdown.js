import React from 'react'
import { PropTypes } from 'prop-types'

import DropdownButton from '../../DropdownButton'
import MenuItem from '../../MenuItem'

const UnMemoisedFontSizeSettingDropdown = ({ defaultFontSize, onChange }) => {
  const changeSize = (size) => {
    onChange(Number(size))
  }

  const renderSizes = () => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 4; size <= maxfontSize; size++) {
      sizeArray.push(
        <MenuItem key={`fontSize-${size}`} eventKey={size} active={defaultFontSize == size}>
          {size}
        </MenuItem>
      )
    }
    return sizeArray
  }

  return (
    <DropdownButton
      className="size-picker"
      title={defaultFontSize}
      onSelect={changeSize}
      id="size-dropdown"
    >
      {renderSizes()}
    </DropdownButton>
  )
}

UnMemoisedFontSizeSettingDropdown.propTypes = {
  defaultFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
}

export const FontSizeSettingDropdown = React.memo(UnMemoisedFontSizeSettingDropdown)

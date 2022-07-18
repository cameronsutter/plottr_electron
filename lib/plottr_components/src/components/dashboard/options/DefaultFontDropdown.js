import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import DropdownButton from '../../DropdownButton'
import MenuItem from '../../MenuItem'

const UnMemoisedDefaultFontDropdown = ({ addRecent, fonts, recentFonts, onChange }) => {
  const defaultFont = recentFonts?.length ? recentFonts[0] : 'Forum'
  const [activeFont, setActiveFont] = useState(defaultFont)

  const changeFont = (font) => {
    setActiveFont(font)
    addRecent(font)
    onChange(font)
  }

  const renderFont = (f, key) => {
    return (
      <MenuItem key={`${f}-${key}`} eventKey={f} style={{ fontFamily: f }} active={activeFont == f}>
        {f}
      </MenuItem>
    )
  }

  const renderFonts = () => {
    let fontItems = recentFonts.map((f) => renderFont(f, 'recents'))
    if (fontItems.length) {
      fontItems.push(<MenuItem divider key="divider" />)
    }
    fontItems = [...fontItems, ...fonts.map((f) => renderFont(f, ''))]
    return fontItems
  }

  return (
    <DropdownButton title={activeFont} onSelect={changeFont} id="font-dropdown">
      {renderFonts()}
    </DropdownButton>
  )
}

UnMemoisedDefaultFontDropdown.propTypes = {
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
}

export const DefaultFontDropdown = React.memo(UnMemoisedDefaultFontDropdown)

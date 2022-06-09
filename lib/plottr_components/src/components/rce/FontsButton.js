import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { ReactEditor } from 'slate-react'

import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'

const UnMemoisedFontsButton = ({ editor, addRecent, fonts, recentFonts, logger }) => {
  const [activeFont, setActiveFont] = useState(getCurrentFont(editor, logger))

  useEffect(() => {
    if (ReactEditor.isFocused(editor)) {
      const timer = setTimeout(() => {
        const newFont = getCurrentFont(editor, logger)
        if (newFont !== activeFont) {
          setActiveFont(newFont)
        }
      }, 100)
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {}
  }, [editor.selection])

  const changeFont = (font) => {
    setActiveFont(font)
    addFontMark(editor, font)
    addRecent(font)
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

UnMemoisedFontsButton.propTypes = {
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export const FontsButton = React.memo(UnMemoisedFontsButton)

const getCurrentFont = (editor, logger) => {
  try {
    const [node] = Editor.nodes(editor, { match: (n) => n.font })
    if (node) {
      return node[0].font
    } else {
      return 'Forum'
    }
  } catch (error) {
    logger.error('Error attempting to get current fonts.', error)
    return 'Forum'
  }
}

const addFontMark = (editor, font) => {
  Editor.addMark(editor, 'font', font)
}

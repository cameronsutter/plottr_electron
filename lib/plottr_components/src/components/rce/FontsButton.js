import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'

const UnMemoisedFontsButton = ({
  editor,
  addRecent,
  fonts,
  recentFonts,
  logger,
  currentSetting,
}) => {
  const [activeFont, setActiveFont] = useState(
    getCurrentFont(editor, logger, recentFonts, currentSetting)
  )

  // needs this so it gets changes to editor.selection
  // I don't know why
  const _editor = useSlate()

  useEffect(() => {
    if (editor.selection) {
      if (ReactEditor.isFocused(editor)) {
        const timer = setTimeout(() => {
          const newFont = getCurrentFont(editor, logger, recentFonts, currentSetting)
          if (newFont !== activeFont) {
            setActiveFont(newFont)
          }
        }, 100)
        return () => {
          clearTimeout(timer)
        }
      }
    }
    return () => {}
  }, [editor.selection])

  useEffect(() => {
    setActiveFont(getCurrentFont(editor, logger, recentFonts, currentSetting))
  }, [recentFonts, currentSetting])

  const changeFont = (font) => {
    setActiveFont(font)
    addRecent(font)
    addFontMark(editor, font)
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
  currentSetting: PropTypes.string,
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
  onChange: PropTypes.func,
}

export const FontsButton = React.memo(UnMemoisedFontsButton)

const getCurrentFont = (editor, logger, recentFonts, currentSetting) => {
  try {
    const [node] = Editor.nodes(editor, { match: (n) => n.font })
    if (node) {
      return node[0].font
    } else {
      if (currentSetting) return currentSetting
      return recentFonts?.length ? recentFonts[0] : 'Forum'
    }
  } catch (error) {
    logger.error('Error attempting to get current fonts.', error)
    return 'Forum'
  }
}

const addFontMark = (editor, font) => {
  Editor.addMark(editor, 'font', font)
}

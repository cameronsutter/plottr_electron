import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export const FontsButton = (props) => {
  const editor = useSlate()

  const [activeFont, setActiveFont] = useState(getCurrentFont(editor))

  useEffect(() => {
    if (ReactEditor.isFocused(editor)) {
      setActiveFont(getCurrentFont(editor))
    }
  }, [editor.selection])

  const changeFont = (font) => {
    setActiveFont(font)
    addFontMark(editor, font)
    props.addRecent(font)
  }

  const renderFont = (f, key) => {
    return (
      <MenuItem key={`${f}-${key}`} eventKey={f} style={{ fontFamily: f }} active={activeFont == f}>
        {f}
      </MenuItem>
    )
  }

  const renderFonts = () => {
    let fontItems = props.recentFonts.map((f) => renderFont(f, 'recents'))
    if (fontItems.length) {
      fontItems.push(<MenuItem divider key="divider" />)
    }
    fontItems = [...fontItems, ...props.fonts.map((f) => renderFont(f, ''))]
    return fontItems
  }

  return (
    <DropdownButton
      title={activeFont}
      onSelect={changeFont}
      id="font-dropdown"
      rootCloseEvent="click"
    >
      {renderFonts()}
    </DropdownButton>
  )
}

FontsButton.propTypes = {
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
}

const getCurrentFont = (editor) => {
  const [node] = Editor.nodes(editor, { match: (n) => n.font })
  if (node) {
    return node[0].font
  } else {
    return 'Forum'
  }
}

const addFontMark = (editor, font) => {
  Editor.addMark(editor, 'font', font)
}

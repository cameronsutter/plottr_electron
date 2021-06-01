import React, { useState, useEffect } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

export const FontSizeChooser = () => {
  const editor = useSlate()
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor))

  useEffect(() => {
    ReactEditor.focus(editor)
    setCurrentSize(getCurrentSize(editor))
  }, [editor.selection])

  const changeSize = (size) => {
    setCurrentSize(Number(size))
    addFontSizeMark(editor, Number(size))
  }

  const renderSizes = () => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 4; size <= maxfontSize; size++) {
      sizeArray.push(
        <MenuItem key={`fontSize-${size}`} eventKey={size} active={currentSize == size}>
          {size}
        </MenuItem>
      )
    }
    return sizeArray
  }

  return (
    <DropdownButton
      className="size-picker"
      title={currentSize}
      onSelect={changeSize}
      id="size-dropdown"
      rootCloseEvent="click"
    >
      {renderSizes()}
    </DropdownButton>
  )
}

const getCurrentSize = (editor) => {
  const [node] = Editor.nodes(editor, { match: (n) => n.fontSize })
  if (node) {
    return node[0].fontSize
  } else {
    return 20
  }
}

const addFontSizeMark = (editor, size) => {
  Editor.addMark(editor, 'fontSize', size)
}

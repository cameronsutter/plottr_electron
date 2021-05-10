import React, { useState, useEffect, useRef } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'

export const FontSizeChooser = () => {
  const editor = useSlate()
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor))

  useEffect(() => {
    setCurrentSize(getCurrentSize(editor))
  }, [editor.selection])

  const changeSize = (val) => {
    setCurrentSize(val)
    addFontSizeMark(editor, val)
  }

  const renderSizes = () => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 1; size <= maxfontSize; size++) {
      sizeArray.push(
        <MenuItem key={size} eventKey={size} active={currentSize === size}>
          {size}
        </MenuItem>
      )
    }
    return sizeArray
  }

  return (
    <div className="font-size-chooser">
      <DropdownButton
        title={currentSize}
        onSelect={changeSize}
        id="font-size-dropdown"
        rootCloseEvent="click"
      >
        {renderSizes()}
      </DropdownButton>
    </div>
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

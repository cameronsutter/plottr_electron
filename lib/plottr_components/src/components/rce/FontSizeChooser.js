import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { Editor } from 'slate'
import { ReactEditor } from 'slate-react'

import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'

const UnMemoisedFontSizeChooser = ({ editor }) => {
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor))

  useEffect(() => {
    if (ReactEditor.isFocused(editor)) {
      const timer = setTimeout(() => {
        const newSize = getCurrentSize(editor)
        if (newSize !== currentSize) {
          setCurrentSize(newSize)
        }
      }, 100)
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {}
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

UnMemoisedFontSizeChooser.propTypes = {
  editor: PropTypes.object.isRequired,
}

export const FontSizeChooser = React.memo(UnMemoisedFontSizeChooser)

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

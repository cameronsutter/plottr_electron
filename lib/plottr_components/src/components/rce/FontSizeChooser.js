import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { FormControl } from 'react-bootstrap'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import cx from 'classnames'

export const FontSizeChooser = ({ darkMode }) => {
  const editor = useSlate()
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor))

  useEffect(() => {
    ReactEditor.focus(editor)
    setCurrentSize(getCurrentSize(editor))
  }, [editor.selection])

  const changeSize = (evt) => {
    setCurrentSize(Number(evt.target.value))
    addFontSizeMark(editor, Number(evt.target.value))
  }

  const renderSizes = () => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 1; size <= maxfontSize; size++) {
      sizeArray.push(
        <option key={`fontSize-${size}`} value={size}>
          {size}
        </option>
      )
    }
    return sizeArray
  }

  return (
    <div className="font-size-chooser">
      <FormControl
        className={cx({ darkmode: darkMode })}
        componentClass="select"
        onChange={changeSize}
        onSelect={changeSize}
        value={currentSize}
      >
        {renderSizes()}
      </FormControl>
    </div>
  )
}

FontSizeChooser.propTypes = {
  darkMode: PropTypes.bool,
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

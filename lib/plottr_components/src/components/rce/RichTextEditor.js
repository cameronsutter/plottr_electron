import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter, createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditorConnector = (connector) => {
  const {
    platform: { openExternal },
  } = connector

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({ ...props }) => {
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => <Element {...innerProps} openExternal={openExternal} />,
      [openExternal]
    )
    const [value, setValue] = useState(null)
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    const key = useRef(Math.random().toString(16))
    useEffect(() => {
      if (!value) {
        setValue(useTextConverter(props.text)) // eslint-disable-line
      }
    }, [props.text])
    useEffect(() => {
      if (props.autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
        document.execCommand('selectAll', false, null)
        document.getSelection().collapseToEnd()
      }
    }, [props.autoFocus, editorWrapperRef])

    const registerEditor = useRegisterEditor(editor)

    if (!value) return null

    const updateValue = (newVal) => {
      setValue(newVal)
      // only update if it changed
      // (e.g. this event could fire with a selection change, but the text is the same)
      if (value !== newVal) {
        props.onChange(newVal)
      }
    }

    const handleKeyDown = (event) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    }

    const handleKeyUp = () => {
      // scroll to the cursor
      if (editor.selection == null) return
      try {
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.focus)
        const node = domPoint[0]
        let isElem = false
        let parent = node.parentElement
        // find the closest parent that is a slate element
        while (!isElem) {
          if (parent == null) {
            isElem = true
            return
          }
          if (parent.dataset.slateNode == 'element') {
            isElem = true
          } else {
            parent = parent.parentElement
          }
        }
        parent.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } catch (e) {
        // Do nothing if there is an error.
      }
    }

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
      // Select all text
      // Push cursor/focus to last char
      // document.execCommand('selectAll', false, null)
      // document.getSelection().collapseToEnd()
    }

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={updateValue} key={key.current}>
        <div className={cx('slate-editor__wrapper', props.className)}>
          <ToolBar editor={editor} darkMode={props.darkMode} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: props.darkMode })}
          >
            <Editable
              spellCheck
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={i18n('Enter some text...')}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
        </div>
      </Slate>
    )
  }

  RichTextEditor.propTypes = {
    text: PropTypes.any,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
  }

  return RichTextEditor
}

export default RichTextEditorConnector

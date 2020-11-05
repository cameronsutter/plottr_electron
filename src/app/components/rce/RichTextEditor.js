import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import i18n from 'format-message'
import isHotkey from 'is-hotkey'
import { ButtonGroup, Overlay, Navbar, Nav, NavItem } from 'react-bootstrap'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { FaBold, FaItalic, FaUnderline, FaQuoteLeft, FaListOl, FaListUl, FaStrikethrough } from 'react-icons/fa'
import ToolBar from './ToolBar'
import { MarkButton, toggleMark } from './MarkButton'
import BlockButton from './BlockButton'
import { LinkButton, withLinks } from './LinkButton'
import { ImagesButton, withImages } from './ImagesButton'
import { ColorButton, addColorMark } from './ColorButton'
import { FontsButton } from './FontsButton'
import { withHTML } from './withHTML'
import MiniColorPicker from '../MiniColorPicker'
import withNormalizer from './Normalizer'
import Leaf from './Leaf'
import Element from './Element'
import cx from 'classnames'
import { useTextConverter } from './helpers'
import { withList } from './withList'
import { useRegisterEditor } from './editor-registry';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditor = (props) => {
  const editor = useMemo(() => {
    return withList(withNormalizer(withHTML(withImages(withLinks(withHistory(withReact(createEditor())))))))
  }, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const [value, setValue] = useState(null)
  const [key, setKey] = useState(Math.random().toString(16))
  const toolbarRef = useRef(null)
  const [showColorPicker, toggleColorPicker] = useState(false)
  const changeColor = color => {
    addColorMark(editor, color)
    toggleColorPicker(false)
  }
  useEffect(() => {
    if (!value) {
      setValue(useTextConverter(props.text))
    }
  }, [props.text])

  const registerEditor = useRegisterEditor(editor);

  if (!value) return null

  const updateValue = newVal => {
    // only update if it changed
    // (e.g. this event could fire with a selection change, but the text is the same)
    if (value !== newVal) {
      setValue(newVal)
      props.onChange(newVal)
    }
  }

  const otherProps = {
    autoFocus: props.autoFocus
  }
  return (
    <Slate editor={editor} value={value} onChange={updateValue} key={key}>
      <div className={cx('slate-editor__wrapper', props.className)}>
        <div className={cx('slate-editor__toolbar-wrapper', {darkmode: props.darkMode})} ref={toolbarRef}>
          <ToolBar wrapperRef={toolbarRef}>
            <ButtonGroup>
              <FontsButton fonts={props.fonts} recentFonts={props.recentFonts} addRecent={props.addRecent} />
              <MarkButton mark='bold' icon={<FaBold/>} />
              <MarkButton mark='italic' icon={<FaItalic/>} />
              <MarkButton mark='underline' icon={<FaUnderline/>} />
              <MarkButton mark='strike' icon={<FaStrikethrough/>} />
              <ColorButton toggle={() => toggleColorPicker(!showColorPicker)}/>
              <BlockButton format='heading-one' icon={i18n('Title')} />
              <BlockButton format='heading-two' icon={i18n('Subtitle')} />
              <BlockButton format='block-quote' icon={<FaQuoteLeft/>} />
              <BlockButton format='numbered-list' icon={<FaListOl/>} />
              <BlockButton format='bulleted-list' icon={<FaListUl/>} />
              <ImagesButton />
            </ButtonGroup>
            <Overlay show={showColorPicker} placement='bottom' container={() => findDOMNode(toolbarRef.current)}>
              <MiniColorPicker chooseColor={changeColor} el={toolbarRef} close={() => toggleColorPicker(false)}/>
            </Overlay>
          </ToolBar>
        </div>
        <div
          // the firstChild will be the contentEditable dom node 
          ref={(e) => registerEditor(e && e.firstChild)} 
          className={cx('slate-editor__editor', {darkmode: props.darkMode})}
        >
          <Editable
            spellCheck
            {...otherProps}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            placeholder={i18n('Enter some text...')}
            onKeyDown={event => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault()
                  const mark = HOTKEYS[hotkey]
                  toggleMark(editor, mark)
                }
              }
            }}
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
}

export default RichTextEditor

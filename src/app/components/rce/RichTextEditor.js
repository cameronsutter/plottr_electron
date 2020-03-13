import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import isHotkey from 'is-hotkey'
import { ButtonGroup } from 'react-bootstrap'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { FaBold, FaItalic, FaUnderline, FaQuoteLeft, FaListOl, FaListUl } from "react-icons/fa"
import ToolBar from './ToolBar'
import { MarkButton, toggleMark } from './MarkButton'
import BlockButton from './BlockButton'
import Leaf from './Leaf'
import Element from './Element'
import { LinkButton, withLinks } from './LinkButton'
import { ImageLinkButton, withImages } from './ImageLinkButton'
import cx from 'classnames'
import { RCE_INITIAL_VALUE } from '../../store/initialState'
import deep from 'deep-diff'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditor = (props) => {
  const editor = useMemo(() => {
    return withImages(withLinks(withHistory(withReact(createEditor()))))
  }, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const [value, setValue] = useState(props.text)

  const updateValue = val => {
    setValue(val)
    props.onChange(val)
  }

  if (props.readOnly && props.text.length == 1) {
    const diff = deep.diff(RCE_INITIAL_VALUE, props.text)
    // nothing to show
    if (!diff) return null
  }

  const otherProps = {
    readOnly: props.readOnly,
  }
  if (props.autoFocus != undefined) otherProps.autoFocus = props.autoFocus
  return (
    <Slate editor={editor} value={value} onChange={updateValue} key={Math.random().toString(16)}>
      <div className='slate-editor__wrapper'>
        <div className={cx('slate-editor__toolbar-wrapper', {readonly: props.readOnly})}>
          <ToolBar>
            <ButtonGroup>
              <MarkButton mark="bold" icon={<FaBold/>} />
              <MarkButton mark="italic" icon={<FaItalic/>} />
              <MarkButton mark="underline" icon={<FaUnderline/>} />
            </ButtonGroup>
            <ButtonGroup>
              <BlockButton format="heading-one" icon={i18n('Title')} />
              <BlockButton format="heading-two" icon={i18n('Subtitle')} />
              <BlockButton format="block-quote" icon={<FaQuoteLeft/>} />
              <BlockButton format="numbered-list" icon={<FaListOl/>} />
              <BlockButton format="bulleted-list" icon={<FaListUl/>} />
            </ButtonGroup>
            <ButtonGroup>
              <LinkButton />
              <ImageLinkButton />
            </ButtonGroup>
          </ToolBar>
        </div>
        <div className={cx('slate-editor__editor', {readonly: props.readOnly})}>
          <Editable
            spellCheck
            {...otherProps}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            placeholder={props.readOnly ? undefined : i18n('enter some text...')}
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
  text: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
}

export default RichTextEditor
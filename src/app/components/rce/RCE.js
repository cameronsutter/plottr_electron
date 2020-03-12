import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import { ButtonGroup } from 'react-bootstrap'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { FaBold, FaItalic, FaUnderline, FaQuoteLeft, FaListOl, FaListUl, FaLink, FaImage } from "react-icons/fa"
import ToolBar from './ToolBar'
import MarkButton from './MarkButton'
import BlockButton from './BlockButton'
import Leaf from './Leaf'
import Element from './Element'

const RCE = (props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const [value, setValue] = useState([{
    children: [{ text: '' }],
  }])
  // const [value, setValue] = useState(props.text)

  const otherProps = {
    autoFocus: props.autoFocus,
  }
  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)} >
      <div className='slate-editor__wrapper'>
        <div className='slate-editor__toolbar-wrapper'>
          <ToolBar>
            <ButtonGroup>
              <MarkButton format="bold" icon={<FaBold/>} />
              <MarkButton format="italic" icon={<FaItalic/>} />
              <MarkButton format="underline" icon={<FaUnderline/>} />
            </ButtonGroup>
            <ButtonGroup>
              <BlockButton format="heading-one" icon={i18n('Title')} />
              <BlockButton format="heading-two" icon={i18n('Subtitle')} />
              <BlockButton format="block-quote" icon={<FaQuoteLeft/>} />
              <BlockButton format="numbered-list" icon={<FaListOl/>} />
              <BlockButton format="bulleted-list" icon={<FaListUl/>} />
            </ButtonGroup>
            <ButtonGroup>
              <BlockButton format="link" icon={<FaLink/>} />
              <BlockButton format="img" icon={<FaImage/>} />
            </ButtonGroup>
          </ToolBar>
        </div>
        <div className='slate-editor__editor'>
          <Editable
            spellCheck
            {...otherProps}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            placeholder="enter some text"
          />
        </div>
      </div>
    </Slate>
  )
}

RCE.propTypes = {
  text: PropTypes.any,
  editable: PropTypes.bool,
  autoFocus: PropTypes.bool,
}

export default RCE
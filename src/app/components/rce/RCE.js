import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { FaBold, FaItalic } from "react-icons/fa"
import ToolBar from './ToolBar'
import MarkButton from './MarkButton'

const RCE = (props) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const [value, setValue] = useState([{
    type: 'paragraph',
    children: [{ text: '' }],
  }])
  // const [value, setValue] = useState(props.text)

  const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>
    }

    if (leaf.italic) {
      children = <em>{children}</em>
    }

    if (leaf.underline) {
      children = <u>{children}</u>
    }

    return <span {...attributes}>{children}</span>
  }

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)} >
      <ToolBar>
        <MarkButton editor={editor} format="bold" icon={<FaBold/>} />
        <MarkButton editor={editor} format="italic" icon={<FaItalic/>} />
      </ToolBar>
      <Editable renderLeaf={renderLeaf} placeholder="enter some text" spellCheck/>
    </Slate>
  )
}

RCE.propTypes = {
  text: PropTypes.any,
  editable: PropTypes.bool,
}

export default RCE
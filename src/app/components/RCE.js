import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const RCE = (props) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: props.text, marks: [] }],
    },
  ])

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)} >
      <Editable placeholder="enter some text" spellCheck/>
    </Slate>
  )
}

RCE.propTypes = {
  text: PropTypes.any,
  editable: PropTypes.bool,
}

export default RCE
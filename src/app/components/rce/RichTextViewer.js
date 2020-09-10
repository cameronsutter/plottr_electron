import React, { useCallback, useMemo, useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import { withLinks } from './LinkButton'
import { withImages } from './ImagesButton'
import { useTextConverter } from './helpers'
import cx from 'classnames'

const RichTextViewer = (props) => {
  const editor = useMemo(() => {
    return withImages(withLinks(withReact(createEditor())))
  }, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const value = useTextConverter(props.text)
  const [key, setKey] = useState(null)
  useEffect(() => {
    setKey(Math.random().toString(16))
  }, [])

  if (!value) return <span/>
  if (!value.length) return <span/>
  if (value[0].children[0].text == '') return <span/>

  return <Slate editor={editor} value={value} key={key}>
    <div className={cx('slate-editor__wrapper', props.className, {readonly: true})}>
      <div className={cx('slate-editor__editor', {readonly: true})}>
        <Editable
          readOnly
          renderLeaf={renderLeaf}
          renderElement={renderElement}
        />
      </div>
    </div>
  </Slate>
}

RichTextViewer.propTypes = {
  text: PropTypes.any,
  className: PropTypes.string,
}

export default RichTextViewer
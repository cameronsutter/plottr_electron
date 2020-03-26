import React, { useCallback, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import { withLinks } from './LinkButton'
import { withImages } from './ImageLinkButton'
import { useTextConverter } from './helpers'
import { RCE_INITIAL_VALUE } from '../../store/initialState'
import cx from 'classnames'
import deep from 'deep-diff'

const RichTextViewer = (props) => {
  const editor = useMemo(() => {
    return withImages(withLinks(withReact(createEditor())))
  }, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const value = useTextConverter(props.text)

  const diff = deep.diff(RCE_INITIAL_VALUE, value)
  // nothing to show
  if (!diff) return null

  return (
    <Slate editor={editor} value={value} key={Math.random().toString(16)}>
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
  )
}

RichTextViewer.propTypes = {
  text: PropTypes.array.isRequired,
}

export default RichTextViewer
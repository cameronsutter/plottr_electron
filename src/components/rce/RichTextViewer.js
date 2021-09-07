import React, { useCallback, useMemo, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter } from './helpers'
import cx from 'classnames'

const RichTextViewer = ({ openExternal, imagePublicURL, isStorageURL, ...props }) => {
  const editor = useMemo(() => {
    return withReact(createEditor())
  }, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback(
    (innerProps) => (
      <Element
        {...innerProps}
        openExternal={openExternal}
        imagePublicURL={imagePublicURL}
        isStorageURL={isStorageURL}
      />
    ),
    [openExternal]
  )
  const value = useTextConverter(props.text, props.log)
  const key = useRef(Math.random().toString(16))

  if (!value) return <span />
  if (!value.length) return <span />
  if (value.length == 1 && value[0].children.length === 1 && value[0].children[0].text == '')
    return <span />

  return (
    <Slate editor={editor} value={value} key={key.current}>
      <div className={cx('slate-editor__wrapper', props.className, { readonly: true })}>
        <div className={cx('slate-editor__editor', { readonly: true })}>
          <Editable readOnly renderLeaf={renderLeaf} renderElement={renderElement} />
        </div>
      </div>
    </Slate>
  )
}

RichTextViewer.propTypes = {
  text: PropTypes.any,
  className: PropTypes.string,
  openExternal: PropTypes.func.isRequired,
  log: PropTypes.object.isRequired,
  isStorageURL: PropTypes.func.isRequired,
  imagePublicURL: PropTypes.func.isRequired,
}

export default RichTextViewer

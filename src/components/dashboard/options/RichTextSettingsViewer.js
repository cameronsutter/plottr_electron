import React, { useCallback, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import cx from 'classnames'

import Leaf from '../../rce/Leaf'
import Element from '../../rce/Element'
import { halfLoremIpsum, rceHalfLoremIpsum } from '../../utils/loremIpsum'
import { useEffect } from 'react'
import { useState } from 'react'

const RichTextSettingsViewer = (props) => {
  const editor = useMemo(() => {
    return withReact(createEditor(props.log))
  }, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback(
    (innerProps) => (
      <Element
        {...innerProps}
        openExternal={() => {}}
        imagePublicURL={() => {}}
        isStorageURL={() => {}}
        imageCache={{}}
        cacheImage={() => {}}
      />
    ),
    []
  )
  const [value, setValue] = useState(rceHalfLoremIpsum)
  useEffect(() => {
    const newVal = [
      {
        type: 'paragraph',
        children: [
          {
            font: props.fontFamily,
            fontSize: props.fontSize,
            text: halfLoremIpsum,
          },
        ],
      },
    ]
    setValue(newVal)
  }, [props.fontFamily, props.fontSize])

  return (
    <Slate editor={editor} value={value}>
      <div className={cx('slate-editor__wrapper', { readonly: true })}>
        <div className={cx('slate-editor__editor', { readonly: true, rceLocked: false })}>
          <Editable readOnly renderLeaf={renderLeaf} renderElement={renderElement} />
        </div>
      </div>
    </Slate>
  )
}

RichTextSettingsViewer.propTypes = {
  fontFamily: PropTypes.string,
  fontSize: PropTypes.number,
  log: PropTypes.object.isRequired,
}

export default RichTextSettingsViewer

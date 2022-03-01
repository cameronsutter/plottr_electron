import React, { useCallback, useMemo, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { FaLock } from 'react-icons/fa'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import cx from 'classnames'

import { t } from 'plottr_locales'

import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter } from './helpers'

const RichTextViewer = ({
  stealingLock,
  stealLock,
  openExternal,
  imagePublicURL,
  isStorageURL,
  imageCache,
  cacheImage,
  ...props
}) => {
  const editor = useMemo(() => {
    return withReact(createEditor(props.log))
  }, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback(
    (innerProps) => (
      <Element
        {...innerProps}
        openExternal={openExternal}
        imagePublicURL={imagePublicURL}
        isStorageURL={isStorageURL}
        imageCache={imageCache}
        cacheImage={cacheImage}
      />
    ),
    [openExternal, cacheImage, imageCache]
  )
  const value = useTextConverter(props.text, props.log)
  const key = useRef(Math.random().toString(16))
  const isLocked = props.lock && props.lock.clientId && props.lock?.clientId !== props.clientId

  return (
    <Slate editor={editor} value={value} key={key.current}>
      {!props.disabled && isLocked ? (
        <div className="lock-icon__wrapper" disabled={stealingLock} onClick={stealLock}>
          <span>{t('Take Control')}</span>
          <FaLock />
        </div>
      ) : null}
      <div className={cx('slate-editor__wrapper', props.className, { readonly: true })}>
        <div
          className={cx('slate-editor__editor', {
            readonly: true,
            rceLocked: !props.disabled && isLocked,
          })}
        >
          <Editable readOnly renderLeaf={renderLeaf} renderElement={renderElement} />
        </div>
      </div>
    </Slate>
  )
}

RichTextViewer.propTypes = {
  text: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  openExternal: PropTypes.func.isRequired,
  log: PropTypes.object.isRequired,
  isStorageURL: PropTypes.func,
  imagePublicURL: PropTypes.func,
  lock: PropTypes.object,
  clientId: PropTypes.string,
  stealingLock: PropTypes.bool,
  stealLock: PropTypes.func,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

export default RichTextViewer

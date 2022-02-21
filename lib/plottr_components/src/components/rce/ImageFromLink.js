import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import cx from 'classnames'

const ImageFromLink = ({
  attributes,
  children,
  imagePublicURL,
  selected,
  focused,
  element,
  imageCache,
  cacheImage,
}) => {
  const publicImageUrl = imageCache[element.storageUrl]?.publicUrl

  useEffect(() => {
    if (!publicImageUrl && element.storageUrl) {
      imagePublicURL(element.storageUrl).then((imageUrl) => {
        cacheImage(element.storageUrl, imageUrl)
      })
    }
  }, [imageCache, imagePublicURL, publicImageUrl, element.storageUrl])

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={publicImageUrl}
          className={cx('slate-editor__image-link', { selected: selected && focused })}
        />
      </div>
      {children}
    </div>
  )
}

ImageFromLink.propTypes = {
  attributes: PropTypes.array.isRequired,
  children: PropTypes.array,
  imagePublicURL: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  focused: PropTypes.bool,
  element: PropTypes.object.isRequired,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

export default React.memo(ImageFromLink)

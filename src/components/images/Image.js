import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { checkDependencies } from '../checkDependencies'
import { Spinner } from '../Spinner'

const ImageConnector = (connector) => {
  const {
    platform: {
      storage: { resolveToPublicUrl },
    },
  } = connector
  checkDependencies({ resolveToPublicUrl })

  const Image = ({ size, shape, image, responsive, className, imageCache, cacheImage }) => {
    const [imageSrc, setImageSrc] = useState(null)

    const publicImageUrl = imageCache[image?.path]?.publicUrl

    const isOnStorage = () => {
      return image?.path?.startsWith('storage://')
    }

    useEffect(() => {
      if (!publicImageUrl && image?.path && isOnStorage()) {
        resolveToPublicUrl(image?.path).then((imageUrl) => {
          cacheImage(image?.path, imageUrl)
          setImageSrc(imageUrl)
        })
      }
    }, [cacheImage, imageCache, resolveToPublicUrl, publicImageUrl, image?.path])

    useEffect(() => {
      setImageSrc(null)
    }, [setImageSrc, image])

    useEffect(() => {
      if (!image || imageSrc) return

      if (isOnStorage()) {
        setImageSrc(publicImageUrl)
      } else {
        setImageSrc(image.data)
      }
    }, [image, setImageSrc, imageSrc])

    useEffect(() => {
      if (!image && imageSrc) {
        setImageSrc(null)
      }
    }, [image, imageSrc])

    if (!image && !imageSrc) return null
    else if (!image || !imageSrc) return <Spinner />

    if (responsive) {
      return <img className={cx('img-responsive', className)} src={imageSrc} />
    } else {
      let klasses = cx(`image-${shape}-${size}`, className)
      return <div className={klasses} style={{ backgroundImage: `url(${imageSrc})` }} />
    }
  }

  Image.propTypes = {
    imageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    size: PropTypes.oneOf(['xl', 'large', 'small', 'xs']),
    shape: PropTypes.oneOf(['circle', 'rounded', 'square']),
    responsive: PropTypes.bool,
    className: PropTypes.string,
    image: PropTypes.object,
    imageCache: PropTypes.object.isRequired,
    cacheImage: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors })
  if (redux) {
    const { connect } = redux

    return connect(
      (state, ownProps) => {
        return {
          image: state.present.images[ownProps.imageId],
          imageCache: selectors.imageCacheSelector(state.present),
        }
      },
      {
        cacheImage: actions.imageCache.cacheImage,
      }
    )(Image)
  }

  throw new Error('Couldnt find connector for Image.js')
}

export default ImageConnector

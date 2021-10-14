import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { checkDependencies } from '../checkDependencies'

const ImageConnector = (connector) => {
  const {
    platform: {
      os,
      storage: { resolveToPublicUrl },
    },
  } = connector
  checkDependencies({ os, resolveToPublicUrl })

  const Image = ({ size, shape, image, responsive, className }) => {
    const [imageSrc, setImageSrc] = useState(null)

    const isOnStorage = () => {
      return image?.path.startsWith('storage://')
    }

    useEffect(() => {
      if (!image) return

      if (isOnStorage()) {
        resolveToPublicUrl(image.path).then((url) => {
          setImageSrc(url)
        })
      } else {
        setImageSrc(image.data)
      }
    }, [image, setImageSrc, imageSrc])

    if (!image || !imageSrc) return null

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
  }

  const { redux } = connector
  checkDependencies({ redux })
  if (redux) {
    const { connect } = redux

    return connect((state, ownProps) => {
      return {
        image: state.present.images[ownProps.imageId],
      }
    })(Image)
  }

  throw new Error('Couldnt find connector for Image.js')
}

export default ImageConnector

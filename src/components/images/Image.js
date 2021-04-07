import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

const ImageConnector = (connector) => {
  class Image extends Component {
    render() {
      let image = this.props.image
      const { size, images, shape, responsive, imageId, className } = this.props
      if (!image && images) image = images[imageId]
      if (!image) return null

      if (responsive) {
        return <img className={cx('img-responsive', className)} src={image.data} />
      } else {
        let klasses = cx(`image-${shape}-${size}`, className)
        return <div className={klasses} style={{ backgroundImage: `url(${image.data})` }} />
      }
    }

    static propTypes = {
      imageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      size: PropTypes.oneOf(['xl', 'large', 'small', 'xs']),
      shape: PropTypes.oneOf(['circle', 'rounded', 'square']),
      responsive: PropTypes.bool,
      className: PropTypes.string,
      image: PropTypes.object,
      images: PropTypes.object,
    }
  }

  const { redux } = connector
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

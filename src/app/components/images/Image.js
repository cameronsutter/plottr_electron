import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'

class Image extends Component {
  render () {
    const { size, shape, image, responsive, className } = this.props
    if (!image) return null

    if (responsive) {
      return <img className={cx('img-responsive', className)} src={image.data} />
    } else {
      let klasses = cx(`image-${shape}-${size}`, className)
      return <div className={klasses} style={{backgroundImage: `url(${image.data})`}} />
    }

  }

  static propTypes = {
    imageId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    size: PropTypes.oneOf(['xl', 'large', 'small', 'xs']),
    shape: PropTypes.oneOf(['circle', 'rounded', 'rectangle']),
    responsive: PropTypes.bool,
    className: PropTypes.string,
    image: PropTypes.object,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    image: state.images[ownProps.imageId],
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Image)
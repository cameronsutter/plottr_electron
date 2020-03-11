import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

export default class ImageCircle extends Component {
  render () {
    let klasses = 'image-circle-'
    switch (this.props.size) {
      case 'large':
        klasses += 'large'
        break;
      case 'small':
        klasses += 'small'
        break;
      case 'xs':
        klasses += 'xs'
        break;
      default:
        klasses = 'large'
        break;
    }
    return <div className={klasses} style={{backgroundImage: `url(${this.props.imageData})`}} />
  }

  static propTypes = {
    imageData: PropTypes.string.isRequired,
    size: PropTypes.string,
  }
}
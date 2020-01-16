import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

const width = 200 + 20
const height = 70

export default class CardSVGline extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    orientation: PropTypes.string.isRequired,
    spacer: PropTypes.bool
  }

  linePlacement () {
    if (this.props.orientation == 'vertical') {
      return width / 2
    }
    return height / 2
  }

  lineLength () {
    if (this.props.spacer) return 20;
    if (this.props.orientation == 'vertical') return height;
    return width;
  }

  render () {
    let style = {stroke: this.props.color}
    const placement = this.linePlacement()
    const length = this.lineLength()
    if (this.props.orientation === 'vertical') {
      return (<svg height={length} width={width}>
        <line y1='0' x1={placement} y2={length} x2={placement} className='card__svg-line' style={style} />
      </svg>)
    } else {
      return (<svg width={length} height={height}>
        <line x1='0' y1={placement} x2={length} y2={placement} className='card__svg-line' style={style} />
      </svg>)
    }
  }
}

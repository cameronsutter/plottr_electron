import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

const width = 200 + 20
const height = 70

export default class CardSVGline extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    orientation: PropTypes.string.isRequired,
  }

  linePlacement () {
    if (this.props.orientation == 'vertical') {
      return width / 2
    }
    return height / 2
  }

  render () {
    let style = {stroke: this.props.color}
    const placement = this.linePlacement()
    if (this.props.orientation === 'vertical') {
      return (<svg height={height} >
        <line y1='0' x1={placement} y2={height} x2={placement} className='card__svg-line' style={style} />
      </svg>)
    } else {
      return (<svg width={width} >
        <line x1='0' y1={placement} x2={width} y2={placement} className='card__svg-line' style={style} />
      </svg>)
    }
  }
}

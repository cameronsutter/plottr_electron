import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'

export default class CardSVGline extends PureComponent {
  static propTypes = {
    color: PropTypes.string.isRequired,
    orientation: PropTypes.string.isRequired,
    spacer: PropTypes.bool
  }

  height () {
    if (this.props.orientation == 'vertical') return 150
    return 70
  }

  width () {
    if (this.props.orientation == 'vertical') return 200
    return 200 + 20
  }

  linePlacement () {
    if (this.props.orientation == 'vertical') return this.width() / 2
    return this.height() / 2
  }

  lineLength () {
    if (this.props.spacer) {
      if (this.props.orientation == 'vertical') return 40;
      return 20;
    }
    if (this.props.orientation == 'vertical') return this.height();
    return this.width();
  }

  render () {
    let style = {stroke: this.props.color}
    const placement = this.linePlacement()
    const length = this.lineLength()
    if (this.props.orientation === 'vertical') {
      return (<svg height={length} width={this.width()}>
        <line y1='0' x1={placement} y2={length} x2={placement} className='card__svg-line' style={style} />
      </svg>)
    } else {
      return (<svg width={length} height={this.height()}>
        <line x1='0' y1={placement} x2={length} y2={placement} className='card__svg-line' style={style} />
      </svg>)
    }
  }
}
